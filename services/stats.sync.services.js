const axios = require("axios");
const Team = require("../models/Team");
const Gameweek = require("../models/Gameweek");
const Fixture = require("../models/Fixture");
const { bulkUpsertPlayers } = require("../models/player");

const BOOTSTRAP_URL = "https://fantasy.premierleague.com/api/bootstrap-static/";
const FIXTURES_URL = "https://fantasy.premierleague.com/api/fixtures/";

// ─── Fetchers ────────────────────────────────────────────

const fetchBootstrapStatic = async () => {
  const response = await axios.get(BOOTSTRAP_URL);
  return response.data;
};

const fetchFixtures = async () => {
  const response = await axios.get(FIXTURES_URL);
  return response.data;
};

// ─── Normalizers ─────────────────────────────────────────

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

// ─── Main sync ───────────────────────────────────────────

const syncAll = async () => {
  // Single bootstrap call — reuse for teams, gameweeks, players
  const bootstrapData = await fetchBootstrapStatic();
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

module.exports = {
  syncAll,
  fetchBootstrapStatic,
  normalizeTeams,
  normalizeGameweeks,
  normalizePlayers,
  normalizeFixtures,
};