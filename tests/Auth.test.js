const { mockQuery } = require('./helpers/infra-mocks');
 
const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const { makeToken, testUser } = require('./helpers/fixtures');
 
const BASE = '/api/v1/auth';
 
beforeEach(() => jest.clearAllMocks());
 
describe('POST /api/v1/auth/signup', () => {
  const validBody = { username: 'newuser', email_id: 'new@example.com', password: 'secret123' };
 
  it('creates a user and returns a token', async () => {
   
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ user_id: 2, username: 'newuser', email_id: 'new@example.com' }] });
 
    const res = await request(app).post(`${BASE}/signup`).send(validBody);
 
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.username).toBe('newuser');
  });
 
  it('returns 409 for a duplicate email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [testUser] }); 
 
    const res = await request(app).post(`${BASE}/signup`).send(validBody);
 
    expect(res.status).toBe(409);
  });
 
  it('returns 400 when the request body fails validation', async () => {
    
    const res = await request(app)
      .post(`${BASE}/signup`)
      .send({ username: 'ab', email_id: 'not-an-email', password: '123' });
 
    expect(res.status).toBe(400);
  });
});
 
describe('POST /api/v1/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const hashed = await bcrypt.hash('secret123', 10);
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...testUser, password: hashed }],
    });
 
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email_id: testUser.email_id, password: 'secret123' });
 
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });
 
  it('returns 401 for wrong password', async () => {
    const hashed = await bcrypt.hash('secret123', 10);
    mockQuery.mockResolvedValueOnce({ rows: [{ ...testUser, password: hashed }] });
 
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email_id: testUser.email_id, password: 'wrongpassword' });
 
    expect(res.status).toBe(401);
  });
});
 
describe('GET /api/v1/auth/getme', () => {
  it('returns the authenticated user when given a valid token', async () => {

    mockQuery.mockResolvedValueOnce({ rows: [testUser] });
 
    const res = await request(app)
      .get(`${BASE}/getme`)
      .set('Authorization', `Bearer ${makeToken(1)}`);
 
    expect(res.status).toBe(200);
    expect(res.body.data.user_id).toBe(1);
  });
 
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get(`${BASE}/getme`);
    expect(res.status).toBe(401);
  });
});