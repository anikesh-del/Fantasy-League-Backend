const { syncQueue} = require('../queues');

const startScheduler = async () => {
  // Runs every 6 hours — syncs current gameweek player stats
  await syncQueue.add(
    'syncCurrentGameweek',
    {},
    {
      jobId: 'sync-current-gameweek',
      repeat: { every: 6 * 60 * 60 * 1000 },  // ms
      removeOnComplete: 10,
      removeOnFail: 20,
    }
  );

  await syncQueue.add(
    'syncAll',
    {},
    {
       jobId: 'sync-all',
      repeat: { every: 6 * 60 * 60 * 1000 },  // ms
      removeOnComplete: 10,
      removeOnFail: 20,
    }
  );
};

module.exports = { startScheduler };
