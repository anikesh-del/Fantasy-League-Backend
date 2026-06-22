const { mockQuery } = require('./helpers/infra-mocks');
 
const request = require('supertest');
const app = require('../app');
const { makeToken, testUser, testTeam } = require('./helpers/fixtures');
 
const BASE = '/api/v1/fantasy';
const auth = { Authorization: `Bearer ${makeToken(testUser.user_id)}` };
const mockAuthUser = () => mockQuery.mockResolvedValueOnce({ rows: [testUser] });
 
beforeEach(() => jest.clearAllMocks());
 
describe('GET /api/v1/fantasy/points', () => {
  it("doubles the captain's points", async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 3 }] })   
      .mockResolvedValueOnce({ rows: [testTeam] })     
      .mockResolvedValueOnce({ rows: [               
        { player_api_id: 301, is_captain: true, is_vice_captain: false },
      ] })
      .mockResolvedValueOnce({ rows: [                 // getGameweekStatsForPlayers
        { player_id: 301, minutes: 90, total_points: 8 },
      ] });
 
    const res = await request(app).get(`${BASE}/points?gameweek=3`).set(auth);
 
    expect(res.status).toBe(200);
    expect(res.body.data.breakdown[0].final_points).toBe(16); // 8 * 2
  });
 
  it('gives the vice-captain 1.5x only when the captain did not play', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 3 }] })
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [
        { player_api_id: 301, is_captain: true, is_vice_captain: false },
        { player_api_id: 302, is_captain: false, is_vice_captain: true },
      ] })
      .mockResolvedValueOnce({ rows: [
        { player_id: 301, minutes: 0, total_points: 0 },  
        { player_id: 302, minutes: 90, total_points: 6 },
      ] });
 
    const res = await request(app).get(`${BASE}/points?gameweek=3`).set(auth);
 
    const vc = res.body.data.breakdown.find((b) => b.player_id === 302);
    expect(vc.final_points).toBe(9); // 6 * 1.5
  });
 
  it('returns 404 for a gameweek that does not exist', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [] });
 
    const res = await request(app).get(`${BASE}/points?gameweek=99`).set(auth);
 
    expect(res.status).toBe(404);
  });
});
 
describe('GET /api/v1/fantasy/leaderboard', () => {
  it('returns ranked entries with pagination metadata', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [{ rank: '1', username: 'alice', team_name: 'Alice FC', points: '50' }] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });
 
    const res = await request(app).get(`${BASE}/leaderboard?gameweek=3`).set(auth);
 
    expect(res.status).toBe(200);
    expect(res.body.leaderboard).toHaveLength(1);
    expect(res.body.meta.gameweek).toBe(3);
  });
});