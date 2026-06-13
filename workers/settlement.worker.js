require('dotenv').config();
const { Worker } = require('bullmq');
const { settleGameweek } = require('../services/settlement.services');

const connection = require('../config/bullmq-connection');

const settlementWorker = new Worker('settlement', async (job) => {
 const { gameweekId } = job.data;
  
  console.log(`[SettlementWorker] Settling GW ${gameweekId}...`);

  const result = await settleGameweek(gameweekId);
  console.log(`[SettlementWorker] Done:`, result);
  return result;
}, { connection });

settlementWorker.on('failed', (job, err) => {
  console.error(`[SettlementWorker] Job ${job?.id} failed:`, err.message);
});

module.exports = settlementWorker;