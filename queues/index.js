require('dotenv').config();
const { Queue } = require('bullmq');

const connection =require('../config/bullmq-connection');

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