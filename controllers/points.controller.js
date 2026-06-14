const { getFantasyTeamPointsForUser } = require("../services/points.services");
const ApiError = require("../errors/ApiError");

const getFantasyTeamPoints = async (req, res) => {
  const userId = req.user.user_id;
  const { gameweek } = req.query;

  // Delegate to service
  const result = await getFantasyTeamPointsForUser(userId, gameweek);

  res.status(200).json({
    success: true,
    data: result,
  });
};

module.exports = {
  getFantasyTeamPoints,
};