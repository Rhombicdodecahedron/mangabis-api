const Koa = require('koa');

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const cors = require('koa2-cors');
const helmet = require('koa-helmet');

const bodyParser = require('koa-bodyparser');
const cookieParser = require('cookie-parser');

const routes = require('./routes');

// const {logger} = require('./middleware/logger');
const {responseTime, errors} = require('./middleware');

// const serve = require('koa-static')
// const mount = require('koa-mount')

require('dotenv').config({path: `${__dirname}/../.env`})


const app = new Koa();

// disable console.errors for pino
app.silent = true;

// Error handler
app.use(errors);

app.use(conditional());

app.use(etag());

app.use(bodyParser());

// HTTP header security
app.use(helmet());

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Accept'],
  exposeHeaders: ['mctools-api-cache', 'mctools-api-response-time'],
}));

// Set header with API response time
app.use(responseTime);

app.use(cookieParser());

// app.use(logger('dev'));
// app.use(Koa.json());
// app.use(Koa.urlencoded({ extended: false }));

// Register routes
app.use(routes());

// app.use(mount('/public', serve('./uploads')));

module.exports = app;
