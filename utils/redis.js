const redis = require('redis');
require('dotenv').config();

// If you use Redis, please configure the following:
const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-17372.c265.us-east-1-2.ec2.cloud.redislabs.com',
        port: 17372,
    }
  });

  redisClient.connect();

module.exports = {redisClient};
