require('dotenv').config();
const { Queue } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

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