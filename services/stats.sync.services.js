const axios = require("axios");
const Team = require("../models/Team");
const Gameweek = require("../models/Gameweek");
const Fixture = require("../models/Fixture");
const { bulkUpsertPlayers } = require("../models/Player");
const { bulkUpsertPlayerGameweekStats } = require("../models/PlayerGameweekStats");
const pool = require("../config/db");
const ApiError = require("../errors/ApiError");

const BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";
const FIXTURES_URL = "https://fantasy.premierleague.com/api/fixtures/";
const GAMEWEEK_LIVE_URL = "https://fantasy.premierleague.com/api/event";


const CacheService = require('./cache.service');
const KEYS = require('../utils/cacheKeys');
const TTL = { BOOTSTRAP: 3600, TEAM: 300, LEADERBOARD: 300 };

//Fetchers 
const fetchBootstrapStatic = async () => {
  const response = await axios.get(BOOTSTRAP_URL);
  return response.data;
};

const fetchFixtures = async () => {
  const response = await axios.get(FIXTURES_URL);
  return response.data;
};

const fetchGameweekLive=async(gameweekId)=>{
  try{
    const response=await axios.get(`${GAMEWEEK_LIVE_URL}/${gameweekId}/live/`);
    return response.data.elements;
  }catch(error){
    console.error(`Failed to fetch gameweek ${gameweekId}:`, error.message);
    throw error;
  }
};
// Normalizers 

const normalizeTeams = (bootstrapData) => {
  return bootstrapData.teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.short_name,
    strength: t.strength,
  }));
};

const normalizeGameweeks = (bootstrapData) => {
  return bootstrapData.events.map((g) => ({
    id: g.id,
    name: g.name,
    deadlineTime: g.deadline_time,
    isCurrent: g.is_current,
    isNext: g.is_next,
    isFinished: g.finished,
    averageScore: g.average_entry_score ?? null,
  }));
};

const normalizePlayers = (bootstrapData) => {
  return bootstrapData.elements.map((p) => ({
    id: p.id,
    firstName: p.first_name,
    secondName: p.second_name,
    webName: p.web_name,
    teamId: p.team,
    position: p.element_type,
    price: p.now_cost / 10,
    totalPoints: p.total_points,
    goals: p.goals_scored,
    assists: p.assists,
    cleanSheets: p.clean_sheets,
    minutes: p.minutes,
    form: parseFloat(p.form),
    selectedByPercent: parseFloat(p.selected_by_percent),
  }));
};

const normalizeFixtures = (fixturesData) => {
  return fixturesData.map((f) => ({
    id: f.id,
    gameweekId: f.event,
    homeTeamId: f.team_h,
    awayTeamId: f.team_a,
    kickoffTime: f.kickoff_time,
    finished: f.finished,
    homeTeamScore: f.team_h_score ?? null,
    awayTeamScore: f.team_a_score ?? null,
  }));
};

const normalizeGameweekLiveData=(elements, gameweekId)=>{
  return elements.map((el)=>({
    playerId: el.id,
    gameweekId: gameweekId,
    minutes: el.stats.minutes,
    goals: el.stats.goals_scored,
    assists: el.stats.assists,
    cleanSheets: el.stats.clean_sheets,
    goalsConceded: el.stats.goals_conceded,
    yellowCards: el.stats.yellow_cards,
    redCards: el.stats.red_cards,
    saves: el.stats.saves,
    bonus: el.stats.bonus ?? 0,
    totalPoints: el.stats.total_points,
  }));
};
//Main sync 

const syncAll = async () => {
  // Single bootstrap call — reuse for teams, gameweeks, players
 
    const bootstrapData = await CacheService.cacheAside(
    KEYS.BOOTSTRAP,
    TTL.BOOTSTRAP,
    fetchBootstrapStatic 
  );

  const fixturesData = await fetchFixtures();
  
  // Order matters — teams and gameweeks before players and fixtures
  const teams = normalizeTeams(bootstrapData);
  await Team.bulkUpsertTeams(teams);
  console.log(`Synced ${teams.length} teams`);

  const gameweeks = normalizeGameweeks(bootstrapData);
  await Gameweek.bulkUpsertGameweeks(gameweeks);
  console.log(`Synced ${gameweeks.length} gameweeks`);

  const players = normalizePlayers(bootstrapData);
  await bulkUpsertPlayers(players);
  console.log(`Synced ${players.length} players`);

  const fixtures = normalizeFixtures(fixturesData);
  await Fixture.bulkUpsertFixtures(fixtures);
  console.log(`Synced ${fixtures.length} fixtures`);

  return {
    teams: teams.length,
    gameweeks: gameweeks.length,
    players: players.length,
    fixtures: fixtures.length,
  };
};

//Sync player gameweek stats (FAST VERSION) 
const syncPlayerGameweekStats=async (gameweekId) =>{

  const {rows:gwrows }=await pool.query(
     "SELECT id FROM gameweeks WHERE id = $1",
    [gameweekId]
  );

  if(gwrows.length==0){
    throw new ApiError(404, `Gameweek ${gameweekId} not found`);
  }

  console.log(`Fetching gameweek ${gameweekId} live data...`);

  const elements=await fetchGameweekLive(gameweekId);
    console.log(`Received data for ${elements.length} players`);

    const statsForGameweek=normalizeGameweekLiveData(elements,gameweekId);
      console.log(`Inserting ${statsForGameweek.length} stats for gameweek ${gameweekId}...`);

        // Bulk insert
  if (statsForGameweek.length > 0) {
    await bulkUpsertPlayerGameweekStats(statsForGameweek);
  }

  return {
    gameweekId,
    playersProcessed: elements.length,
    statsInserted: statsForGameweek.length,
  };
};

module.exports = {
  syncAll,
  syncPlayerGameweekStats,
  fetchBootstrapStatic,
  normalizeTeams,
  normalizeGameweeks,
  normalizePlayers,
  normalizeFixtures,
};