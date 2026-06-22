const { mockQuery } = require('./helpers/infra-mocks');
 
jest.mock('axios'); 
 
const request = require('supertest');
const axios = require('axios');
const app = require('../app');
const { makeToken, testUser } = require('./helpers/fixtures');
 
const SYNC_BASE = '/api/v1/admin/sync';
const SETTLE_BASE = '/api/v1/admin/settle';
const auth = { Authorization: `Bearer ${makeToken(testUser.user_id)}` };
const mockAuthUser = () => mockQuery.mockResolvedValueOnce({ rows: [testUser] });
 
beforeEach(() => jest.clearAllMocks());
 
describe('POST /api/v1/admin/sync', () => {
  it('syncs teams, gameweeks, players and fixtures from the FPL API', async () => {
    mockAuthUser();
    axios.get
      .mockResolvedValueOnce({
        data: {
          teams: [{ id: 1, name: 'Arsenal', short_name: 'ARS', strength: 4 }],
          events: [{ id: 3, name: 'GW3', deadline_time: '2025-09-01T11:00:00Z', is_current: true, is_next: false, finished: false, average_entry_score: 55 }],
          elements: [{ id: 301, first_name: 'B', second_name: 'S', web_name: 'Saka', team: 1, element_type: 3, now_cost: 85, total_points: 120, goals_scored: 8, assists: 10, clean_sheets: 5, minutes: 2100, form: '7.5', selected_by_percent: '35.2' }],
        },
      })
      .mockResolvedValueOnce({ data: [] }); // fixtures
 
    mockQuery.mockResolvedValue({ rows: [] }); // all subsequent upserts
 
    const res = await request(app).post(`${SYNC_BASE}/`).set(auth);
 
    expect(res.status).toBe(200);
    expect(res.body.data.counts).toMatchObject({ teams: 1, gameweeks: 1, players: 1 });
  });
 
  it('returns 500 when the FPL API is unreachable', async () => {
    mockAuthUser();
    axios.get.mockRejectedValueOnce(new Error('FPL API down'));
 
    const res = await request(app).post(`${SYNC_BASE}/`).set(auth);
 
    expect(res.status).toBe(500);
  });
});
 
describe('POST /api/v1/admin/settle/:gameweek_id', () => {
  it('queues a settlement job for a valid gameweek_id', async () => {
    mockAuthUser();
 
    const res = await request(app).post(`${SETTLE_BASE}/3`).set(auth);
 
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('jobId');
  });
 
  it('returns 400 when gameweek_id is not numeric', async () => {
    mockAuthUser();
 
    const res = await request(app).post(`${SETTLE_BASE}/abc`).set(auth);
 
    expect(res.status).toBe(400);
  });
});