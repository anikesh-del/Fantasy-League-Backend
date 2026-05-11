const { getFantasyTeamPointsForUser } = require("../services/points.services");
const ApiError = require("../errors/ApiError");

const getFantasyTeamPoints = async (req, res) => {
  const userId = req.user.user_id;
  const { gameweek } = req.query;

  // Basic input validation only
  if (!gameweek) {
    throw new ApiError(400, "Gameweek query parameter is required");
  }

  const gameweekId = parseInt(gameweek);

  if (isNaN(gameweekId) || gameweekId < 1) {
    throw new ApiError(400, "Invalid gameweek parameter");
  }

  // Delegate to service
  const result = await getFantasyTeamPointsForUser(userId, gameweekId);

  res.status(200).json({
    success: true,
    data: result,
  });
};

module.exports = {
  getFantasyTeamPoints,
};