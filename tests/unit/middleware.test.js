const express = require('express');
const request = require('supertest');
const { z } = require('zod');
const { validate } = require('../../middlewares/validate.middleware');
const errorHandler = require('../../middlewares/error.middleware');
const ApiError = require('../../errors/ApiError');
 
describe('validate middleware', () => {
  const schema = z.object({
    body: z.object({ name: z.string().min(2) }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  });
 
  const app = express();
  app.use(express.json());
  app.post('/test', validate(schema), (req, res) => res.json({ name: req.body.name }));
  app.use(errorHandler);
 
  it('passes valid input through to the handler', async () => {
    const res = await request(app).post('/test').send({ name: 'Alice' });
    expect(res.status).toBe(200);
  });
 
  it('returns 400 when the schema rejects the input', async () => {
    const res = await request(app).post('/test').send({ name: 'A' });
    expect(res.status).toBe(400);
  });
});
 
describe('errorHandler middleware', () => {
  const buildApp = (thrower) => {
    const app = express();
    app.get('/err', (_req, _res, next) => {
      try { thrower(); } catch (e) { next(e); }
    });
    app.use(errorHandler);
    return app;
  };
 
  it('maps ApiError to its own statusCode', async () => {
    const app = buildApp(() => { throw new ApiError(422, 'Unprocessable'); });
    const res = await request(app).get('/err');
    expect(res.status).toBe(422);
    expect(res.body.error.message).toBe('Unprocessable');
  });
 
  it('maps any other error to a generic 500', async () => {
    const app = buildApp(() => { throw new Error('boom'); });
    const res = await request(app).get('/err');
    expect(res.status).toBe(500);
  });
});