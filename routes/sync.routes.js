const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { 
  runSync, 
  runPlayerGameweekSync 
} = require("../controllers/stats.sync.controllers");

// Base sync: teams, gameweeks, players, fixtures
router.post("/", authMiddleware, runSync);

// Sync player stats for specific gameweek
router.post("/gameweek-stats/:gameweek_id", authMiddleware, runPlayerGameweekSync);

module.exports = router;