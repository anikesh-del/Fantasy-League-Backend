require('dotenv').config();
const { Worker } = require('bullmq');
const { settleGameweek } = require('../services/settlement.services');
const { getCurrentGameweek } = require('../models/Gameweek');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

const settlementWorker = new Worker('settlement', async (job) => {

  const gw = await getCurrentGameweek();
  if (!gw) {
    console.log('[SettlementWorker] No active gameweek');
    return;
  }

  console.log(`[SettlementWorker] Settling GW ${gw.id}...`);

  const result = await settleGameweek(gw.id);
  console.log(`[SettlementWorker] Done:`, result);
  return result;
}, { connection });

settlementWorker.on('failed', (job, err) => {
  console.error(`[SettlementWorker] Job ${job?.id} failed:`, err.message);
});

module.exports = settlementWorker;