const { syncAll } = require("../services/stats.sync.services");

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

module.exports = { runSync };