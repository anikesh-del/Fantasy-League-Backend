const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { 
  runSync, 
  runPlayerGameweekSync 
} = require("../controllers/sync.controller");

// Base sync: teams, gameweeks, players, fixtures
// POST /api/v1/admin/sync
router.post("/", authMiddleware, runSync);

// Sync player stats for specific gameweek
// POST /api/v1/admin/sync/gameweek-stats/:gameweek_id
router.post("/gameweek-stats/:gameweek_id", authMiddleware, runPlayerGameweekSync);

module.exports = router;