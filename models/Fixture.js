const pool = require("../config/db");

const bulkUpsertFixtures = async (fixtures) => {
  if (!fixtures || fixtures.length === 0) return;

  let values = [];
  let placeholders = [];

  fixtures.forEach((f, i) => {
    const base = i * 7;
    placeholders.push(`(
      $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4},
      $${base + 5}, $${base + 6}, $${base + 7}, $${base+ 8}
    )`);
    values.push(
      f.id,
      f.gameweekId,
      f.homeTeamId,
      f.awayTeamId,
      f.kickoffTime,
      f.finished,
      f.homeTeamScore,
      f.awayTeamScore
    );
  });

  const query = `
    INSERT INTO fixtures(
      id, gameweek_id, home_team_id, away_team_id,
      kickoff_time, finished, home_team_score, away_team_score
    )
    VALUES ${placeholders.join(",")}
    ON CONFLICT (id) DO UPDATE SET
      gameweek_id = EXCLUDED.gameweek_id,
      home_team_id = EXCLUDED.home_team_id,
      away_team_id = EXCLUDED.away_team_id,
      kickoff_time = EXCLUDED.kickoff_time,
      finished = EXCLUDED.finished,
      home_team_score = EXCLUDED.home_team_score,
      away_team_score = EXCLUDED.away_team_score,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await pool.query(query, values);
};

module.exports = { bulkUpsertFixtures };