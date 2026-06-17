const { syncQueue} = require('../queues');

const startScheduler = async () => {
  await syncQueue.upsertJobScheduler(
    'sync-current-gameweek',
    { every: 6 * 60 * 60 * 1000 },
    {
      name: 'syncCurrentGameweek',
      data: {},
      opts: { removeOnComplete: 10, removeOnFail: 20 },
    }
  );

  await syncQueue.upsertJobScheduler(
    'sync-all',
    { every: 6 * 60 * 60 * 1000 },
    {
      name: 'syncAll',
      data: {},
      opts: { removeOnComplete: 10, removeOnFail: 20 },
    }
  );
};

module.exports = { startScheduler };
