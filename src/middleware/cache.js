// const Redis = require('ioredis');
const blake3 = require('blake3');
const NodeCache = require('node-cache');
// const {logger} = require('./logger');

/*
let redis;
let redisAvailable = true;
if (process.env.SPACEX_REDIS) {
    redis = new Redis(process.env.SPACEX_REDIS);
} else {
    redis = new Redis();
}
*/
let cacheOnline = true;
let nodeCache;
try {
    nodeCache = new NodeCache();
} catch (e) {
    cacheOnline = false;
}

/*
redis.on('error', () => {
    redisAvailable = false;
});
redis.on('end', () => {
    redisAvailable = false;
});
redis.on('ready', () => {
    redisAvailable = true;
    logger.info('Redis connected');
});
*/
/**
 * BLAKE3 hash func for redis keys
 *
 * @param   {String}    str    String to hash
 * @returns {Buffer}  Hashed result
 */
const hash = (str) => blake3.createHash().update(str).digest('hex');

/**
 * Redis cache middleware
 *
 * @param   {Number}    ttl       Cache TTL in seconds
 * @returns {void}
 */
module.exports = (ttl) => async (ctx, next) => {
    if (process.env.NODE_ENV !== 'production') {
        await next();
        return;
    }
    if (!cacheOnline) {
        ctx.response.set('mangabis-api-cache-online', 'false');
        await next();
        return;
    }

    ctx.response.set('mangabis-api-cache-online', 'true');

    const {url, method} = ctx.request;
    const key = `mangabis-cache:${hash(`${method}${url}${JSON.stringify(ctx.request.body)}`)}`;
    if (ttl) {
        ctx.response.set('Cache-Control', `max-age=${ttl}`);
    } else {
        ctx.response.set('Cache-Control', 'no-store');
    }

    // Only allow cache on whitelist methods
    if (!['GET', 'POST'].includes(ctx.request.method)) {
        await next();
        return;
    }

    let cached;
    try {
        // cached = await redis.get(key);
        cached = await nodeCache.get(key);
        if (cached) {
            ctx.response.status = 200;
            ctx.response.set('mangabis-api-cache', 'HIT');
            ctx.response.type = 'application/json';
            ctx.response.body = cached;
            cached = true;
        }
    } catch (e) {
        cached = false;
    }
    if (cached) {
        return;
    }
    await next();

    const responseBody = JSON.stringify(ctx.response.body);
    ctx.response.set('mangabis-api-cache', 'MISS');

    // Set cache
    try {
        if ((ctx.response.status !== 200) || !responseBody) {
            return;
        }
        // await redis.set(key, responseBody, 'EX', ttl);
        nodeCache.set(
            key,
            responseBody,
            ttl
        );
    } catch (e) {
        console.log(`Failed to set cache: ${e.message}`);
    }
};

// Share redis connection
/*
Object.defineProperty(module.exports, 'redis', {
    value: redis,
    writable: false,
});
*/