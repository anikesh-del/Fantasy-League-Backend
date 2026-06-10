const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validate.middleware');
const {
  createFantasyTeamSchema,
  addPlayerSchema,
  removePlayerSchema,
  updateCaptainSchema,
} = require('../schemas/fantasy.schemas');
const authMiddleware = require('../middlewares/auth.middleware');

const {
  createFantasyTeam,
  viewFantasyTeam,
  addPlayer,
  removePlayer,
  updateCaptain,
  resetTeam,
} = require('../controllers/fantasy.controllers');

const { getFantasyTeamPoints }=require("../controllers/points.controller");
const { getGameweekLeaderboard } = require('../controllers/leaderboard.controllers');


router.get("/points",authMiddleware, getFantasyTeamPoints);

router.get('/leaderboard', authMiddleware, getGameweekLeaderboard);

router
  .route('/team')
  .post(authMiddleware,validate(createFantasyTeamSchema), createFantasyTeam)
  .get(authMiddleware, viewFantasyTeam);

router.post('/team/players', authMiddleware, validate(addPlayerSchema),addPlayer);

router.delete(
  '/team/players/:player_api_id',
  validate(removePlayerSchema),
  authMiddleware,
  removePlayer
);

router.patch('/team/captain', authMiddleware,
  validate(updateCaptainSchema), updateCaptain);

router.delete('/team/reset', authMiddleware, resetTeam);

module.exports = router;
