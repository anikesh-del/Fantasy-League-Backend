const pool = require("../config/db");

async function bulkUpsertPlayers(players) {
  if (!players || players.length === 0) return;

  let values = [];
  let placeholders = [];

  players.forEach((p, i) => {
    const base = i * 14;
    placeholders.push(`(
      $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4},
      $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8},
      $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12},
      $${base + 13}, $${base + 14}
    )`);
    values.push(
      p.id,
      p.firstName,
      p.secondName,
      p.webName,
      p.teamId,
      p.position,
      p.price,
      p.totalPoints,
      p.goals,
      p.assists,
      p.cleanSheets,
      p.minutes,
      p.form,
      p.selectedByPercent
    );
  });

  const query = `
    INSERT INTO players(
      id, first_name, second_name, web_name, team_id, position, price,
      total_points, goals, assists, clean_sheets, minutes, form, selected_by_percent
    )
    VALUES ${placeholders.join(",")}
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      second_name = EXCLUDED.second_name,
      web_name = EXCLUDED.web_name,
      team_id = EXCLUDED.team_id,
      position = EXCLUDED.position,
      price = EXCLUDED.price,
      total_points = EXCLUDED.total_points,
      goals = EXCLUDED.goals,
      assists = EXCLUDED.assists,
      clean_sheets = EXCLUDED.clean_sheets,
      minutes = EXCLUDED.minutes,
      form = EXCLUDED.form,
      selected_by_percent = EXCLUDED.selected_by_percent;
  `;

  await pool.query(query, values);
}

module.exports = { bulkUpsertPlayers };