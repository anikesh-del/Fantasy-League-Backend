// schemas/leaderboard.schemas.js
const { z } = require('zod');

// GET /fantasy/leaderboard?gameweek=1&page=1&limit=50
const getLeaderboardSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    gameweek: z
      .string()
      .regex(/^\d+$/, 'gameweek must be a number')
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'gameweek must be a positive integer')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'page must be a number')
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0, 'page must be a positive integer')
      .default(1),
    limit: z
      .string()
      .regex(/^\d+$/, 'limit must be a number')
      .transform(val => parseInt(val, 10))
      .refine(val => val > 0 && val <= 100, 'limit must be between 1 and 100')
      .default(50),
  }),
});

module.exports = { getLeaderboardSchema };