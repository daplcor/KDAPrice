const redis = require('redis');
require('dotenv').config();

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;
console.log(host, port);
// If you use Redis, please configure the following:
const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: host,
        port: port,
    }
  });

  redisClient.connect();

module.exports = {redisClient};
