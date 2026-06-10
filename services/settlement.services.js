
const { calculateFantasyTeamPoints } = require("./points.services")
const { bulkInsertUserGameweekPoints } = require("../models/User_gameweek_points");
const pool = require("../config/db");
const ApiError = require("../errors/ApiError");
const CacheService = require('./cache.services');


const settleGameweek = async (gameweek_id) => {

  const { rows: gameweekRows } = await pool.query(
    "SELECT id , is_finished FROM gameweeks WHERE id =$1", [gameweek_id]
  );

  if (gameweekRows.length === 0) {
    throw new ApiError(404, `Gameweek ${gameweek_id} not found`);
  }
  
if (!gameweekRows[0].is_finished) {
  throw new ApiError(400, `Gameweek ${gameweek_id} is not finished yet`);
}

  console.log(`Starting settlement for gameweek ${gameweek_id}...`);

  const query = `
    SELECT u.user_id , ft.fantasy_team_id FROM users u INNER JOIN 
    fantasy_team ft ON u.user_id =ft.user_id
    `;

  const { rows: users } = await pool.query(query);

  if (users.length == 0) {
    console.log("No users with fantasy teams found");
    return {
      gameweek_id,
      users_settled: 0,
    };
  }

  console.log(`Found ${users.length} users with fantasy teams`);


  const userGameweekData = [];

  for (const user of users) {
    try {
      const result = await calculateFantasyTeamPoints(
        user.fantasy_team_id,
        gameweek_id
      );

      userGameweekData.push({
        user_id: user.user_id,
        fantasy_team_id: user.fantasy_team_id,
        gameweek: gameweek_id,
        points: result.total_points,
      });

      console.log(
        `Calculated points for user ${user.user_id}: ${result.total_points}`
      );
    } catch (error) {
      console.error(
        `Failed to calculate points for user ${user.user_id}:`,
        error.message
      );
    }
  }

  if (userGameweekData.length > 0) {
    await bulkInsertUserGameweekPoints(userGameweekData);
    console.log(`Inserted ${userGameweekData.length} user gameweek points`);
  }

  await CacheService.delPattern('leaderboard:*');
  console.log('Leaderboard cache invalidated after settlement');

  return {
    gameweek_id,
    users_settled: userGameweekData.length,
    total_users: users.length
  };
};



module.exports = {
  settleGameweek
}