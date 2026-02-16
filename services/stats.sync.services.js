const axios = require("axios");

const BOOTSTRAP_URL =
  "https://fantasy.premierleague.com/api/bootstrap-static/";

async function fetchBootstrapStatic() {
  try {
    const response = await axios.get(BOOTSTRAP_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching bootstrap:", error.message);
    throw error;
  }
}

function normalizePlayers(bootstrapData) {
  if (!bootstrapData || !bootstrapData.elements) {
    throw new Error("Invalid bootstrap data");
  }

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
}

module.exports = {
  fetchBootstrapStatic,
  normalizePlayers,
};
