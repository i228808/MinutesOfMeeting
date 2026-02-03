const Redis = require('ioredis');

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // Retry strategy: try 5 times, then fail (so app doesn't hang forever if Redis is down)
    retryStrategy: (times) => {
        if (times > 5) {
            console.error('Redis connection failed. Ensure Redis is running.');
            return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: null // Required by BullMQ
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
    console.log('Redis connected successfully');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

module.exports = redis;
