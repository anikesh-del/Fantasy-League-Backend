const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validate.middleware');
const { settleGameweekSchema } = require('../schemas/admin.schemas');
const { runSettlement } = require('../controllers/settlement.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/:gameweek_id', authMiddleware, validate(settleGameweekSchema), runSettlement);

module.exports = router;