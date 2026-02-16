const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { runSync } = require("../controllers/sync.controller");

// TODO: replace authMiddleware with adminMiddleware once role-based auth is built
router.post("/", authMiddleware, runSync);

module.exports = router;