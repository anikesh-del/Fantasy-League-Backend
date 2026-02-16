const FantasyTeam = require("../models/FantasyTeam");
const FantasyTeamPlayer = require("../models/Fantasy_team_players");
const ApiError = require("../errors/ApiError");

const POSITION_MAP = { 1: "GK", 2: "DEF", 3: "MID", 4: "FWD" };

const createFantasyTeam = async ({ userId, teamName }) => {
  const existingTeam = await FantasyTeam.getTeamByUserId(userId);
  if (existingTeam) {
    throw new ApiError(409, "User already has a fantasy team");
  }

  const team = await FantasyTeam.createFantasyTeam({
    user_id: userId,
    team_name: teamName,
  });

  return team;
};

const getFantasyTeam = async (userId) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team does not exist");
  }

  const players = await FantasyTeamPlayer.getPlayersByTeam(
    team.fantasy_team_id
  );

  const formattedPlayers = players.map((p) => ({
    ...p,
    position: POSITION_MAP[p.position] ?? p.position,
  }));

  return {
    ...team,
    players: formattedPlayers,
  };
};

const addPlayer = async ({ userId, player_api_id, position }) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  const players = await FantasyTeamPlayer.getPlayersByTeam(
    team.fantasy_team_id
  );

  if (players.length >= 11) {
    throw new ApiError(400, "Team already has 11 players");
  }

  const duplicate = players.find((p) => p.player_api_id === player_api_id);
  if (duplicate) {
    throw new ApiError(409, "Player already in team");
  }

  return await FantasyTeamPlayer.addPlayer({
    fantasy_team_id: team.fantasy_team_id,
    player_api_id,
    position,
  });
};

const removePlayer = async ({ userId, player_api_id }) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  await FantasyTeamPlayer.removePlayer({
    fantasy_team_id: team.fantasy_team_id,
    player_api_id,
  });
};

const updateCaptain = async ({ userId, captain_id, vice_captain_id }) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  const players = await FantasyTeamPlayer.getPlayersByTeam(
    team.fantasy_team_id
  );

  const ids = players.map((p) => p.player_api_id);

  if (captain_id && !ids.includes(captain_id)) {
    throw new ApiError(400, "Captain not in team");
  }

  if (vice_captain_id && !ids.includes(vice_captain_id)) {
    throw new ApiError(400, "Vice captain not in team");
  }

  if (captain_id && vice_captain_id && captain_id === vice_captain_id) {
    throw new ApiError(400, "Captain and vice captain cannot be the same");
  }

  await FantasyTeamPlayer.resetCaptains(team.fantasy_team_id);

  if (captain_id) {
    await FantasyTeamPlayer.setCaptain({
      fantasy_team_id: team.fantasy_team_id,
      player_api_id: captain_id,
    });
  }

  if (vice_captain_id) {
    await FantasyTeamPlayer.setViceCaptain({
      fantasy_team_id: team.fantasy_team_id,
      player_api_id: vice_captain_id,
    });
  }
};

const resetTeam = async (userId) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  await FantasyTeamPlayer.resetTeam(team.fantasy_team_id);
};

module.exports = {
  createFantasyTeam,
  getFantasyTeam,
  addPlayer,
  removePlayer,
  updateCaptain,
  resetTeam,
};