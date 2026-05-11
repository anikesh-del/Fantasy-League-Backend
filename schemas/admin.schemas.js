// schemas/admin.schemas.js
const { z } = require('zod');

// POST /admin/sync/gameweek-stats/:id
const syncGameweekStatsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z
      .string({ required_error: 'gameweek id is required' })
      .regex(/^\d+$/, 'gameweek id must be a number')
      .transform(val => parseInt(val, 10)),
  }),
  query: z.object({}).optional(),
});

// POST /admin/settle/:gameweek_id
const settleGameweekSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    gameweek_id: z
      .string({ required_error: 'gameweek_id is required' })
      .regex(/^\d+$/, 'gameweek_id must be a number')
      .transform(val => parseInt(val, 10)),
  }),
  query: z.object({}).optional(),
});

module.exports = { syncGameweekStatsSchema, settleGameweekSchema };