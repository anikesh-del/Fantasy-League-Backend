const{z}=require('zod');

//POST /fantasy/team/players
const addPlayerSchema=z.object({
body:z.object({
    player_api_id: z
    .number({ required_error: 'player_api_id is required' })
    .int('player_api_id must be an integer')
    .positive('player_api_id must be positive'),
}),
params:z.object({}).optional(),
query:z.object({}).optional(),
});

//POST/fantasy/team
const createFantasyTeamSchema = z.object({
  body:z.object({
    team_name: z
    .string({ required_error: 'team_name is required' })
    .min(3, 'team_name must be at least 3 characters')
    .max(50, 'team_name must be at most 50 characters')
    .trim(),
  }),

  params: z.object({}).optional(),
  query:z.object({}).optional(),
});

// DELETE /fantasy/team/players/:player_api_id
const removePlayerSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    player_api_id: z
      .string({ required_error: 'player_api_id is required' })
      .regex(/^\d+$/, 'player_api_id must be a number')
      .transform(val => parseInt(val, 10)), // params are always strings, convert here
  }),
  query: z.object({}).optional(),
});

// PATCH /fantasy/team/captain
const updateCaptainSchema = z.object({
  body: z.object({
    captain_id: z
      .number({ required_error: 'captain_id is required' })
      .int('captain_id must be an integer')
      .positive('captain_id must be positive'),
    vice_captain_id: z
      .number({ required_error: 'vice_captain_id is required' })
      .int('vice_captain_id must be an integer')
      .positive('vice_captain_id must be positive'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = {
  createFantasyTeamSchema,
  addPlayerSchema,
  removePlayerSchema,
  updateCaptainSchema,
};