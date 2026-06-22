// services/settlement.services.js

const { calculateFantasyTeamPoints } = require("./points.services");
const UserGameweekPoints = require("../models/User_gameweek_points");
const PlayerGameweekStats = require("../models/PlayerGameweekStats");
const pool = require("../config/db");
const ApiError = require("../errors/ApiError");
const CacheService = require('./cache.services');

const settleGameweek = async (gameweek_id) => {
  
  const { rows: gameweekRows } = await pool.query(
    "SELECT id, is_finished FROM gameweeks WHERE id = $1",
    [gameweek_id]
  );
  if (gameweekRows.length === 0)
    throw new ApiError(404, `Gameweek ${gameweek_id} not found`);
  if (!gameweekRows[0].is_finished)
    throw new ApiError(400, `Gameweek ${gameweek_id} is not finished yet`);

  const { rows: users } = await pool.query(`
    SELECT u.user_id, ft.fantasy_team_id
    FROM users u
    INNER JOIN fantasy_team ft ON u.user_id = ft.user_id
  `);

  if (users.length === 0) {
    console.log("No users with fantasy teams found");
    return { gameweek_id, users_settled: 0 };
  }

  const fantasyTeamIds = users.map(u => u.fantasy_team_id);

  const placeholders = fantasyTeamIds.map((_, i) => `$${i + 1}`).join(',');
  const { rows: allTeamPlayers } = await pool.query(
    `SELECT fantasy_team_id, player_api_id, is_captain, is_vice_captain
     FROM fantasy_team_players
     WHERE fantasy_team_id IN (${placeholders})`,
    fantasyTeamIds
  );

  // Group by fantasy_team_id in memory
  const playersByTeam = {};
  for (const row of allTeamPlayers) {
    if (!playersByTeam[row.fantasy_team_id])
      playersByTeam[row.fantasy_team_id] = [];
    playersByTeam[row.fantasy_team_id].push(row);
  }

  //all unique ids
  const allPlayerIds = [...new Set(allTeamPlayers.map(p => p.player_api_id))];

  // gameweek stats
 const gameweekStats =
  await PlayerGameweekStats.getGameweekStatsForPlayers(
    allPlayerIds,
    gameweek_id
  );

  //gameweekstats according to player ids
  const statsByPlayerId = {};
  for (const stat of gameweekStats) {
    statsByPlayerId[stat.player_id] = stat;
  }

  // Calculate points 
  const userGameweekData = [];

  for (const user of users) {
    const teamPlayers = playersByTeam[user.fantasy_team_id] ?? [];
    if (teamPlayers.length === 0) continue;

    const captain = teamPlayers.find(p => p.is_captain);
    const captainStats = captain ? statsByPlayerId[captain.player_api_id] : null;
    const captainDidntPlay = !captainStats || captainStats.minutes === 0;

    let totalPoints = 0;

    for (const teamPlayer of teamPlayers) {
      const playerStats = statsByPlayerId[teamPlayer.player_api_id];
      const basePoints = playerStats?.total_points ?? 0;
      let finalPoints = basePoints;

      if (teamPlayer.is_captain && basePoints > 0) {
        finalPoints = basePoints * 2;
      } else if (teamPlayer.is_vice_captain && captainDidntPlay && basePoints > 0) {
        finalPoints = basePoints * 1.5;
      }

      totalPoints += Math.round(finalPoints);
    }

    userGameweekData.push({
      user_id: user.user_id,
      fantasy_team_id: user.fantasy_team_id,
      gameweek: gameweek_id,
      points: totalPoints,
    });
  }

  if (userGameweekData.length > 0) {
    await UserGameweekPoints.bulkInsertUserGameweekPoints(userGameweekData);
  }

  await CacheService.delPattern('leaderboard:*');

  return {
    gameweek_id,
    users_settled: userGameweekData.length,
    total_users: users.length,
  };
};

module.exports = { settleGameweek };