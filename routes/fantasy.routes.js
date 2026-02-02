const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware');

const {
  createFantasyTeam,
  viewFantasyTeam,
  addPlayer,
  removePlayer,
  updateCaptain,
  resetTeam,
} = require('../controllers/fantasy.controllers');

router
  .route('/team')
  .post(authMiddleware, createFantasyTeam)
  .get(authMiddleware, viewFantasyTeam);

router.post('/team/players', authMiddleware, addPlayer);

router.delete(
  '/team/players/:player_api_id',
  authMiddleware,
  removePlayer
);

router.patch('/team/captain', authMiddleware, updateCaptain);

router.delete('/team/reset', authMiddleware, resetTeam);

module.exports = router;
