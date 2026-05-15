const { Queue } = require('bullmq');
const redis = require('../config/redis');

import 'dotenv/config';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

const syncQueue = new Queue('sync', {
  connection,
});

const settlementQueue = new Queue('settlement', {
  connection,
});

module.exports = {
  syncQueue,
  settlementQueue,
};