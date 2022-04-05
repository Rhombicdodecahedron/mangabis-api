/**
 *  Application entry point
 *
 * @author     Alexis Stella
 * @version    1.0.0
 * @since      04.04.2022
 * @package    App
 */

const Koa = require('koa');

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const cors = require('koa2-cors');
const helmet = require('koa-helmet');

const bodyParser = require('koa-bodyparser');
const cookieParser = require('cookie-parser');

const serve = require('koa-static')
const mount = require('koa-mount')
const routes = require('./routes');

const {logger} = require('./middleware/logger');
const {responseTime, errors, database} = require('./middleware');

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
    exposeHeaders: ['mangabis-api-cache', 'mangabis-api-response-time'],
}));

// Set header with API response time
app.use(responseTime);

app.use(cookieParser());

// Register routes
app.use(routes());

app.use(mount('/public', serve('./public')));

const host = process.env.HOST
const user = process.env.USER
const password = process.env.PASSWORD
const databaseName = process.env.DATABASE_NAME

database.connectToDatabase(host, user, password, databaseName)
    .then(() => {
        logger.info('Connected to database');
    })
    .catch(err => {
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            logger.error('Invalid credentials');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            logger.error('Database does not exist');
        } else if (err.code === 'ECONNREFUSED') {
            logger.error('Database connection refused');
        } else if (err.code === 'ENOTFOUND') {
            logger.error('Database host not found');
        } else {
            logger.error(err);
        }
    })

module.exports = app;