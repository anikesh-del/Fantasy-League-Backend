const { Worker } = require('bullmq');
const { syncAll, syncPlayerGameweekStats } = require('../services/stats.sync.services');
const { getCurrentGameweek } = require('../models/Gameweek');
const redis = require('../config/redis');

const connection = new redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

const syncworker= new Worker('sync' , async(job)=>{
    if(job.name=='syncAll'){
       console.log('[SyncWorker] Running full sync...');
    const result = await syncAll();
    console.log('[SyncWorker] Done:', result);
    return result;
    }

    if(job.name=='syncCurrentGameweek'){
        const gw = await getCurrentGameweek();
        if(!gw){ console.log('[SyncWorker] No active gameweek'); return;}
        console.log(`[SyncWorker] Syncing GW ${gw.id} stats...`);
    const result = await syncPlayerGameweekStats(gw.id);
    console.log('[SyncWorker] Done:', result);
    return result;
    }
},{connection});

syncWorker.on('failed', (job, err) => {
  console.error(`[SyncWorker] Job ${job.id} failed:`, err.message);
});

module.exports = syncWorker;