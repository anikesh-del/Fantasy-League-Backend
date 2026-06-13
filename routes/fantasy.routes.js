const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validate.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const {
  createFantasyTeamSchema,
  addPlayerSchema,
  removePlayerSchema,
  updateCaptainSchema,
} = require('../schemas/fantasy.schemas');

const { getLeaderboardSchema } = require('../schemas/leaderboard.schemas');

const {getPointsSchema}=require("../schemas/points.schemas");


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

router.use(authMiddleware);
router.use(rateLimiter());

router.get("/points", validate(getPointsSchema),getFantasyTeamPoints);

router.get('/leaderboard', validate(getLeaderboardSchema), getGameweekLeaderboard);

router
  .route('/team')
  .post(validate(createFantasyTeamSchema), createFantasyTeam)
  .get(viewFantasyTeam);

router.post('/team/players', validate(addPlayerSchema),addPlayer);

router.delete(
  '/team/players/:player_api_id',
  validate(removePlayerSchema),
  removePlayer
);

router.patch('/team/captain',
  validate(updateCaptainSchema), updateCaptain);

router.delete('/team/reset', resetTeam);

module.exports = router;
