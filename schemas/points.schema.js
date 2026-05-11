// schemas/points.schemas.js
const { z } = require('zod');

// GET /fantasy/points?gameweek=1
const getPointsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    gameweek: z
      .string({ required_error: 'gameweek is required' })
      .regex(/^\d+$/, 'gameweek must be a number')
      .transform(val => parseInt(val, 10)),
  }),
});

module.exports = { getPointsSchema };