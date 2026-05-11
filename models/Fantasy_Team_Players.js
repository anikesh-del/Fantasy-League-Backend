const pool = require("../config/db");
const ApiError = require("../errors/ApiError");

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

// models/Fantasy_team_players.js

const updateCaptainsTransaction = async ({ fantasy_team_id, captain_id, vice_captain_id }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock + fetch in one shot inside the transaction
    const { rows } = await client.query(
      `SELECT player_api_id FROM fantasy_team_players
       WHERE fantasy_team_id = $1 FOR UPDATE`,
      [fantasy_team_id]
    );
    const ids = rows.map(r => r.player_api_id);

    if (captain_id && !ids.includes(captain_id))
      throw new ApiError(400, 'Captain not in team');
    if (vice_captain_id && !ids.includes(vice_captain_id))
      throw new ApiError(400, 'Vice captain not in team');
    if (captain_id && vice_captain_id && captain_id === vice_captain_id)
      throw new ApiError(400, 'Captain and vice captain cannot be the same player');

    await client.query(
      `UPDATE fantasy_team_players SET is_captain = FALSE, is_vice_captain = FALSE
       WHERE fantasy_team_id = $1`,
      [fantasy_team_id]
    );
    if (captain_id) {
      await client.query(
        `UPDATE fantasy_team_players SET is_captain = TRUE
         WHERE fantasy_team_id = $1 AND player_api_id = $2`,
        [fantasy_team_id, captain_id]
      );
    }
    if (vice_captain_id) {
      await client.query(
        `UPDATE fantasy_team_players SET is_vice_captain = TRUE
         WHERE fantasy_team_id = $1 AND player_api_id = $2`,
        [fantasy_team_id, vice_captain_id]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
async function getSquadSummary(fantasyTeamId){

  const query=`
  SELECT
  COUNT(*) AS total_players,
  COALESCE (SUM(p.price), 0) AS total_cost,
  COUNT (*) FILTER (WHERE ftp.position='GKP') AS gkp_count,
  COUNT (*) FILTER (WHERE ftp.position='DEF') AS def_count,
  COUNT (*) FILTER (WHERE ftp.position='MID') AS mid_count,
  COUNT (*) FILTER (WHERE ftp.position='FWD') AS fwd_count
  FROM fantasy_team_players ftp
  INNER JOIN players p ON p.id= ftp.player_api_id
  WHERE ftp.fantasy_team_id=$1
  `
  const result= await pool.query(query,[fantasyTeamId]);

   const row = result.rows[0];
  return {
    total_players : parseInt(row.total_players, 10),
    total_cost    : parseFloat(row.total_cost),
    gk_count      : parseInt(row.gkp_count, 10),
    def_count     : parseInt(row.def_count, 10),
    mid_count     : parseInt(row.mid_count, 10),
    fwd_count     : parseInt(row.fwd_count, 10),
  };
}


async function getPlayerInTeam(fantasyTeamId, playerApiId) {
  const result = await pool.query(
    `SELECT 1 FROM fantasy_team_players 
     WHERE fantasy_team_id = $1 AND player_api_id = $2`,
    [fantasyTeamId, playerApiId]
  );
  return result.rows[0] || null; 
}


module.exports = {
  addPlayer,
  removePlayer,
  getPlayersByTeam,
  resetTeam,
  resetCaptains,
  updateCaptainsTransaction,
  getSquadSummary,
  getPlayerInTeam
};