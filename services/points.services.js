const FantasyTeamPlayer = require("../models/Fantasy_Team_Players");
const FantasyTeam = require("../models/FantasyTeam");
const { getGameweekStatsForPlayers } = require("../models/PlayerGameweekStats");
const pool = require("../config/db");
const ApiError = require("../errors/ApiError");

// ─── Existing function (unchanged) ──────────────────────

const calculateFantasyTeamPoints = async (fantasy_team_id, gameweek_id) => {
  const teamPlayers = await FantasyTeamPlayer.getPlayersByTeam(fantasy_team_id);

  if (!teamPlayers || teamPlayers.length === 0) {
    throw new ApiError(400, "No players found in this fantasy team");
  }

  const playerIds = teamPlayers.map((p) => p.player_api_id);
  const gameweekStats = await getGameweekStatsForPlayers(playerIds, gameweek_id);

  const captain = teamPlayers.find((p) => p.is_captain);
  const captainStats = captain
    ? gameweekStats.find((s) => s.player_id === captain.player_api_id)
    : null;
  const captainDidntPlay = !captainStats || captainStats.minutes === 0;

  let totalPoints = 0;
  const breakdown = [];

  for (const teamPlayer of teamPlayers) {
    const playerStats = gameweekStats.find(
      (s) => s.player_id === teamPlayer.player_api_id
    );

    let basePoints = playerStats ? playerStats.total_points : 0;
    let finalPoints = basePoints;
    let multiplier = 1;

    if (teamPlayer.is_captain && basePoints > 0) {
      multiplier = 2;
      finalPoints = basePoints * 2;
    } else if (teamPlayer.is_vice_captain && captainDidntPlay && basePoints > 0) {
      multiplier = 1.5;
      finalPoints = basePoints * 1.5;
    }

    totalPoints += finalPoints;

    breakdown.push({
      player_id: teamPlayer.player_api_id,
      base_points: basePoints,
      multiplier: multiplier,
      final_points: finalPoints,
      is_captain: teamPlayer.is_captain || false,
      is_vice_captain: teamPlayer.is_vice_captain || false,
      minutes: playerStats ? playerStats.minutes : 0,
    });
  }

  return {
    fantasy_team_id,
    gameweek_id,
    total_points: totalPoints,
    breakdown,
  };
};

// ─── NEW function for controller ───────────────────────

const getFantasyTeamPointsForUser = async (userId, gameweekId) => {
  // Validate gameweek exists
  const { rows: gameweekRows } = await pool.query(
    "SELECT id FROM gameweeks WHERE id = $1",
    [gameweekId]
  );

  if (gameweekRows.length === 0) {
    throw new ApiError(404, `Gameweek ${gameweekId} not found`);
  }

  // Get user's fantasy team
  const fantasyTeam = await FantasyTeam.getTeamByUserId(userId);

  if (!fantasyTeam) {
    throw new ApiError(404, "You don't have a fantasy team yet. Create one first.");
  }

  // Calculate points
  const pointsData = await calculateFantasyTeamPoints(
    fantasyTeam.fantasy_team_id,
    gameweekId
  );

  return {
    team_name: fantasyTeam.team_name,
    gameweek: gameweekId,
    total_points: pointsData.total_points,
    breakdown: pointsData.breakdown,
  };
};

module.exports = {
  calculateFantasyTeamPoints,
  getFantasyTeamPointsForUser,  
};