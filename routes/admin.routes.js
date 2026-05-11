const express = require('express');
const router = express.Router();

const { runSettlement } = require('../controllers/settlement.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/:gameweek_id', authMiddleware, runSettlement);

module.exports = router;