const FantasyTeam = require("../models/FantasyTeam");
const FantasyTeamPlayer = require("../models/Fantasy_Team_Players");
const Player = require('../models/player');
const ApiError = require("../errors/ApiError");
const Gameweek = require('../models/Gameweek');

const POSITION_MAP = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

const CacheService = require('./cache.service');
const KEYS = require('../utils/cacheKeys');

const TTL = {
  TEAM: 300,
};

//to check the deadline
const checkDeadline = async () => {
  const gameweek = await Gameweek.getCurrentGameweek();

  if (!gameweek) {
    throw new ApiError(404, 'No active gameweek found');
  }

  const now = new Date();
  const deadline = new Date(gameweek.deadline_time);

  if (now > deadline) {
    throw new ApiError(403, `Transfer window closed — deadline was ${deadline.toUTCString()}`);
  }
};

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

  return CacheService.cacheAside(
    KEYS.fantasyTeam(userId),
    TTL.TEAM,
    async () => {
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
    }
  );

};

const addPlayer = async ({ userId, player_api_id, position }) => {

  //checking if the team actually exist
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  await checkDeadline();

  //checking if the player actually exists or not
  const player = await Player.getPlayerById(player_api_id);
  if (!player) throw new ApiError(404, 'Player not found');



  //getting the summary 
  const squad = await FantasyTeamPlayer.getSquadSummary(team.fantasy_team_id);

  //checking if the player is a duplicate
  const existing = await FantasyTeamPlayer.getPlayerInTeam(team.fantasy_team_id, player_api_id);
  if (existing) throw new ApiError(409, 'Player already in your team');

  //validating if the total players exceed the maximum
  if (squad.total_players >= 15) {
    throw new ApiError(400, 'Squad is full (max 15 players)');
  }

  const positionLimits = { GKP: 2, DEF: 5, MID: 5, FWD: 3 };
  const positionCounts = {
    GKP: squad.gkp_count,
    DEF: squad.def_count,
    MID: squad.mid_count,
    FWD: squad.fwd_count,
  };

  if (positionCounts[position] >= positionLimits[position]) {
    throw new ApiError(400, `Position full: max ${positionLimits[position]} ${position} allowed`);
  }

  const newTotal = squad.total_cost + parseFloat(player.price);
  if (newTotal > 100.0) {
    throw new ApiError(400, `Over budget: adding this player exceeds £100m`);
  }

  const result= await FantasyTeamPlayer.addPlayer({
    fantasy_team_id: team.fantasy_team_id,
    player_api_id,
    position,
  });

  await CacheService.del(KEYS.fantasyTeam(userId));
  return result;
};

const removePlayer = async ({ userId, player_api_id }) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }
  await checkDeadline();

  await FantasyTeamPlayer.removePlayer({
    fantasy_team_id: team.fantasy_team_id,
    player_api_id,
  });

  await CacheService.del(KEYS.fantasyTeam(userId));
};


const updateCaptain = async ({ userId, captain_id, vice_captain_id }) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) throw new ApiError(404, 'Fantasy team not found');

  await FantasyTeamPlayer.updateCaptainsTransaction({
    fantasy_team_id: team.fantasy_team_id,
    captain_id,
    vice_captain_id,
  });

  await CacheService.del(KEYS.fantasyTeam(userId));
};

const resetTeam = async (userId) => {
  const team = await FantasyTeam.getTeamByUserId(userId);
  if (!team) {
    throw new ApiError(404, "Fantasy team not found");
  }

  await FantasyTeamPlayer.resetTeam(team.fantasy_team_id);

  await CacheService.del(KEYS.fantasyTeam(userId));
};

module.exports = {
  createFantasyTeam,
  getFantasyTeam,
  addPlayer,
  removePlayer,
  updateCaptain,
  resetTeam,
};