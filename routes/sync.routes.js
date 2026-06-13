const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require('../middlewares/validate.middleware');
const { syncGameweekStatsSchema } = require('../schemas/admin.schemas');
const { 
  runSync, 
  runPlayerGameweekSync 
} = require("../controllers/stats.sync.controllers");

// Base sync: teams, gameweeks, players, fixtures
router.post("/", authMiddleware, runSync);

// Sync player stats for specific gameweek
router.post("/gameweek-stats/:gameweek_id", authMiddleware, validate(syncGameweekStatsSchema), runPlayerGameweekSync);

module.exports = router;