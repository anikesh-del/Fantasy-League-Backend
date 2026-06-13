const { settlementQueue } = require('../queues');

const runSettlement = async (req, res) => {
  const { gameweek_id } = req.params;

  // Call service to settle
  const job = await settlementQueue.add(
  'settlement',
  { gameweekId:gameweek_id },
  {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,  
    },
    removeOnComplete: 10,
    removeOnFail: 20,
  }
);

  res.status(202).json({
    success: true,
    message: `Settlement job queued for GW ${gameweekId}`,
    jobId: job.id,
  });
};

module.exports = {
  runSettlement,
};