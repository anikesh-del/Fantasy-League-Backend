const pool = require("../config/db");

const createFantasyTeam = async ({ user_id, team_name }) => {
  const query = `
    INSERT INTO fantasy_team (user_id, team_name)
    VALUES ($1, $2)
    RETURNING fantasy_team_id, user_id, team_name;
  `;

  const values = [user_id, team_name];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getTeamByUserId = async (user_id) => {
  const query = `
    SELECT fantasy_team_id, user_id, team_name
    FROM fantasy_team
    WHERE user_id = $1;
  `;

  const { rows } = await pool.query(query, [user_id]);
  return rows[0];
};

module.exports = {
  createFantasyTeam,
  getTeamByUserId,
};
