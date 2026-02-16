const pool = require("../config/db");

const addPlayer = async ({ fantasy_team_id, player_api_id, position }) => {
  const query = `
    INSERT INTO fantasy_team_players(fantasy_team_id, player_api_id, position)
    VALUES ($1, $2, $3)
    RETURNING fantasy_team_id, player_api_id, position;
  `;
  const values = [fantasy_team_id, player_api_id, position];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const removePlayer = async ({ fantasy_team_id, player_api_id }) => {
  const query = `
    DELETE FROM fantasy_team_players
    WHERE fantasy_team_id = $1 AND player_api_id = $2;
  `;
  await pool.query(query, [fantasy_team_id, player_api_id]);
};

const getPlayersByTeam = async (fantasy_team_id) => {
  const query = `
    SELECT player_api_id, position, is_captain, is_vice_captain
    FROM fantasy_team_players
    WHERE fantasy_team_id = $1;
  `;
  const { rows } = await pool.query(query, [fantasy_team_id]);
  return rows;
};

const resetTeam = async (fantasy_team_id) => {
  const query = `
    DELETE FROM fantasy_team_players
    WHERE fantasy_team_id = $1;
  `;
  await pool.query(query, [fantasy_team_id]);
};

const resetCaptains = async (fantasy_team_id) => {
  const query = `
    UPDATE fantasy_team_players
    SET is_captain = FALSE, is_vice_captain = FALSE
    WHERE fantasy_team_id = $1;
  `;
  await pool.query(query, [fantasy_team_id]);
};

const setCaptain = async ({ fantasy_team_id, player_api_id }) => {
  const query = `
    UPDATE fantasy_team_players
    SET is_captain = TRUE
    WHERE fantasy_team_id = $1 AND player_api_id = $2;
  `;
  await pool.query(query, [fantasy_team_id, player_api_id]);
};

const setViceCaptain = async ({ fantasy_team_id, player_api_id }) => {
  const query = `
    UPDATE fantasy_team_players
    SET is_vice_captain = TRUE
    WHERE fantasy_team_id = $1 AND player_api_id = $2;
  `;
  await pool.query(query, [fantasy_team_id, player_api_id]);
};

module.exports = {
  addPlayer,
  removePlayer,
  getPlayersByTeam,
  resetTeam,
  resetCaptains,
  setCaptain,
  setViceCaptain,
};