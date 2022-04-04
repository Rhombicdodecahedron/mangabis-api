const koaPino = require('koa-pino-logger');
const pino = require('pino');

// Logger middleware
const devOpts = {
    prettyPrint: true,
};

// Environment variable
const env = process.env.NODE_ENV;

let requestLog;
let logger;

// Check if the environment is development or production
if (env === 'production' || env === 'stage') {
    requestLog = koaPino();
    logger = pino();
} else {
    requestLog = koaPino(devOpts);
    logger = pino(devOpts);
}

module.exports.requestLogger = requestLog;
module.exports.logger = logger;