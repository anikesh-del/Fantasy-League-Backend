const { settleGameweek } = require("../services/settlement.services");
const ApiError = require("../errors/ApiError");

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
  const result = await settleGameweek(gameweekId);

  res.status(200).json({
    success: true,
    data: {
      message: `Gameweek ${gameweekId} settled successfully`,
      gameweek_id: result.gameweek_id,
      users_settled: result.user_settled,
      total_users: result.total_users,
    },
  });
};

module.exports = {
  runSettlement,
};