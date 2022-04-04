const Router = require('koa-router');

const FOLDERS = [
    // todo: add more folders
];

const ROUTER = new Router();

/**
 * Register all routes + all versions
 *
 * @api {get} /
 * @returns {(function(*, *): (*))|*}
 */
module.exports = () => {
    FOLDERS.forEach((routeFolder) => {
        routeFolder.forEach((version) => {
            ROUTER.use(version.routes());
        });
    });
    return ROUTER.routes();
};