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
    page: z.coerce
      .number({ invalid_type_error: 'page must be a number' })
      .int('page must be an integer')
      .positive('page must be a positive integer')
      .default(1),
    limit: z.coerce
      .number({ invalid_type_error: 'limit must be a number' })
      .int('limit must be an integer')
      .min(1, 'limit must be between 1 and 100')
      .max(100, 'limit must be between 1 and 100')
      .default(50),
  }),
});

module.exports = { getLeaderboardSchema };