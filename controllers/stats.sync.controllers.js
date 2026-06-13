const { 
  syncAll, 
  syncPlayerGameweekStats 
} = require("../services/stats.sync.services");
const ApiError = require("../errors/ApiError");

const runSync = async (req, res) => {
  const result = await syncAll();

  res.status(200).json({
    success: true,
    data: {
      message: "Sync completed successfully",
      counts: result,
    },
  });
};


const runPlayerGameweekSync = async (req, res) => {
  const { gameweek_id } = req.params;

  const result = await syncPlayerGameweekStats(gameweek_id);

  res.status(201).json({
    success: true,
    data: {
      message: `Gameweek ${gameweek_id} stats synced successfully`,
      counts: result,
    },
  });
};

module.exports = { runSync,
  runPlayerGameweekSync,
 };