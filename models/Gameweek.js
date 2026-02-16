const pool = require("../config/db");

const bulkUpsertGameweeks = async (gameweeks) => {
  if (!gameweeks || gameweeks.length === 0) return;

  let values = [];
  let placeholders = [];

  gameweeks.forEach((g, i) => {
    const base = i * 7;
    placeholders.push(`(
      $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4},
      $${base + 5}, $${base + 6}, $${base + 7}
    )`);
    values.push(
      g.id,
      g.name,
      g.deadlineTime,
      g.isCurrent,
      g.isNext,
      g.isFinished,
      g.averageScore
    );
  });

  const query = `
    INSERT INTO gameweeks(
      id, name, deadline_time, is_current,
      is_next, is_finished, average_score
    )
    VALUES ${placeholders.join(",")}
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      deadline_time = EXCLUDED.deadline_time,
      is_current = EXCLUDED.is_current,
      is_next = EXCLUDED.is_next,
      is_finished = EXCLUDED.is_finished,
      average_score = EXCLUDED.average_score,
      updated_at = CURRENT_TIMESTAMP;
  `;

  await pool.query(query, values);
};

const getCurrentGameweek = async () => {
  const query = `
    SELECT * FROM gameweeks WHERE is_current = TRUE LIMIT 1;
  `;
  const { rows } = await pool.query(query);
  return rows[0];
};

module.exports = { 
    bulkUpsertGameweeks, 
    getCurrentGameweek };