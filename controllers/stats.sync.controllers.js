const {
  fetchBootstrapStatic,
  normalizePlayers,
} = require("../services/stats.sync.service");

const { bulkUpsertPlayers } = require("../models/player.model");

const syncPlayers = async (req, res) => {
  
  const bootstrapData = await fetchBootstrapStatic();

  
  const players = normalizePlayers(bootstrapData);

  
  await bulkUpsertPlayers(players);

  res.status(200).json({
    success: true,
    message: "Players synced successfully",
    count: players.length,
  });
};

module.exports = {
  syncPlayers,
};
