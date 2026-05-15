const { settleGameweek } = require("../services/settlement.services");
const ApiError = require("../errors/ApiError");
const { settlementQueue } = require('../queues');

const runSettlement = async (req, res) => {
  const { gameweek_id } = req.params;

  // Validate gameweek_id parameter
  if (!gameweek_id || isNaN(gameweek_id)) {
    throw new ApiError(400, "Invalid gameweek_id parameter");
  }

  const gameweekId = parseInt(gameweek_id);

  if (gameweekId < 1) {
    throw new ApiError(400, "Gameweek ID must be a positive number");
  }

  // Call service to settle
   const job = await settlementQueue.add(
    'settle',
    { gameweekId }
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