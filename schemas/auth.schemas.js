// schemas/auth.schemas.js
const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'username is required' })
      .min(3, 'username must be at least 3 characters')
      .max(30, 'username must be at most 30 characters')
      .trim(),
    email_id: z
      .string({ required_error: 'email is required' })
      .email('invalid email format')
      .trim(),
    password: z
      .string({ required_error: 'password is required' })
      .min(6, 'password must be at least 6 characters'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email_id: z
      .string({ required_error: 'email is required' })
      .email('invalid email format')
      .trim(),
    password: z
      .string({ required_error: 'password is required' })
      .min(1, 'password is required'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = { signupSchema, loginSchema };