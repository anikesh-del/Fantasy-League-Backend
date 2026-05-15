const { syncQueue , settlementQueue } = require('../queues');

const startScheduler = async () => {
  // Runs every 6 hours — syncs current gameweek player stats
  await syncQueue.add(
    'syncCurrentGameweek',
    {},
    {
      repeat: { every: 6 * 60 * 60 * 1000 },  // ms
      removeOnComplete: 10,
      removeOnFail: 20,
    }
  );

  await syncQueue.add(
    'syncAll',
    {},
    {
      repeat: { every: 6 * 60 * 60 * 1000 },  // ms
      removeOnComplete: 10,
      removeOnFail: 20,
    }
  );

   await settlementQueue.add(
    'settlement',
    {},
    {
      repeat: { every: 6 * 60 * 60 * 1000 },
      removeOnComplete: 10,
      removeOnFail: 20,
    }
  );
  console.log('[Scheduler] Sync job scheduled every 6 hours');
};

module.exports = { startScheduler };
