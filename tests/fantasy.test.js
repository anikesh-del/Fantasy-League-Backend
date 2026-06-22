const { mockQuery, mockConnect, mockPoolInstance } = require('./helpers/infra-mocks');
 
const request = require('supertest');
const app = require('../app');
const { makeToken, testUser, testTeam } = require('./helpers/fixtures');
 
const BASE = '/api/v1/fantasy';
const auth = { Authorization: `Bearer ${makeToken(testUser.user_id)}` };
 

const mockAuthUser = () => mockQuery.mockResolvedValueOnce({ rows: [testUser] });
 
beforeEach(() => jest.clearAllMocks());
 
describe('POST /api/v1/fantasy/team', () => {
  it('creates a team when the user has none yet', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [] })          
      .mockResolvedValueOnce({ rows: [testTeam] });  
 
    const res = await request(app)
      .post(`${BASE}/team`)
      .set(auth)
      .send({ team_name: 'Test FC' });
 
    expect(res.status).toBe(201);
  });
 
  it('rejects a second team for the same user', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [testTeam] }); 
 
    const res = await request(app)
      .post(`${BASE}/team`)
      .set(auth)
      .send({ team_name: 'Second FC' });
 
    expect(res.status).toBe(409);
  });
});
 
describe('POST /api/v1/fantasy/team/players', () => {
  const futureDeadline = new Date(Date.now() + 86400000).toISOString();
  const pastDeadline = new Date(Date.now() - 86400000).toISOString();
 
  it('adds a player when squad has room and budget allows it', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [{ deadline_time: futureDeadline }] })
      .mockResolvedValueOnce({ rows: [{ id: 301, price: '6.0', position: 'MID' }] })
      .mockResolvedValueOnce({ rows: [{
        total_players: '5', total_cost: '45.0',
        gkp_count: '1', def_count: '2', mid_count: '1', fwd_count: '1',
      }] })
      .mockResolvedValueOnce({ rows: [] }) // not already in team
      .mockResolvedValueOnce({ rows: [{ fantasy_team_id: 10, player_api_id: 301, position: 'MID' }] });
 
    const res = await request(app)
      .post(`${BASE}/team/players`)
      .set(auth)
      .send({ player_api_id: 301 });
 
    expect(res.status).toBe(201);
  });
 
  it('rejects adding a player once the squad has 15 players', async () => {
    mockAuthUser();
       mockQuery
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [{ deadline_time: futureDeadline }] })
      .mockResolvedValueOnce({ rows: [{ id: 301, price: '6.0', position: 'MID' }] })
      .mockResolvedValueOnce({ rows: [{ total_players: '15', total_cost: '95.0', gkp_count: '2', def_count: '5', mid_count: '5', fwd_count: '3' }] })
      .mockResolvedValueOnce({ rows: [] }); 
 
    const res = await request(app)
      .post(`${BASE}/team/players`)
      .set(auth)
      .send({ player_api_id: 301});
 
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/squad is full/i);
  });
 
  it('rejects a player that would exceed the £100m budget', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [{ deadline_time: futureDeadline }] })
      .mockResolvedValueOnce({ rows: [{ id: 301, price: '15.0', position: 'MID' }] })
      .mockResolvedValueOnce({ rows: [{ total_players: '5', total_cost: '90.0', gkp_count: '1', def_count: '2', mid_count: '1', fwd_count: '1' }] })
      .mockResolvedValueOnce({ rows: [] });
 
    const res = await request(app)
      .post(`${BASE}/team/players`)
      .set(auth)
      .send({ player_api_id: 301 });
 
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/over budget/i);
  });
 
  it('rejects a position once that position is full (e.g. 2 GKPs)', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [{ deadline_time: futureDeadline }] })
      .mockResolvedValueOnce({ rows: [{ id: 301, price: '4.5', position: 'GKP' }] })
      .mockResolvedValueOnce({ rows: [{ total_players: '10', total_cost: '70.0', gkp_count: '2', def_count: '4', mid_count: '3', fwd_count: '1' }] })
      .mockResolvedValueOnce({ rows: [] });
 
    const res = await request(app)
      .post(`${BASE}/team/players`)
      .set(auth)
      .send({ player_api_id: 303 });
 
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/position full/i);
  });
 
  it('rejects adding a player after the gameweek deadline has passed', async () => {
    mockAuthUser();
    mockQuery
      .mockResolvedValueOnce({ rows: [testTeam] })
      .mockResolvedValueOnce({ rows: [{ deadline_time: pastDeadline }] });
 
    const res = await request(app)
      .post(`${BASE}/team/players`)
      .set(auth)
      .send({ player_api_id: 301 });
 
    expect(res.status).toBe(403);
    expect(res.body.error.message).toMatch(/transfer window closed/i);
  });
});
 
describe('PATCH /api/v1/fantasy/team/captain', () => {
  
  const mockTransactionClient = (queryResponses) => {
  const client = { query: jest.fn(), release: jest.fn() };
  queryResponses.forEach((r) => client.query.mockResolvedValueOnce(r));
  mockPoolInstance.connect = jest.fn().mockResolvedValue(client);
};
 
  it('sets a captain who is in the squad', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [testTeam] }); 
 
    mockTransactionClient([
      undefined,                                                   
      { rows: [{ player_api_id: 301 }, { player_api_id: 302 }] },  
      undefined,                                                   
      undefined,                                                   
      undefined,                                                   
    ]);
 
    const res = await request(app)
      .patch(`${BASE}/team/captain`)
      .set(auth)
      .send({ captain_id: 301 });
 
    expect(res.status).toBe(200);
  });
 
  it('rejects a captain who is not in the squad', async () => {
    mockAuthUser();
    mockQuery.mockResolvedValueOnce({ rows: [testTeam] });
 
    mockTransactionClient([
      undefined,
      { rows: [{ player_api_id: 301 }, { player_api_id: 302 }] },
    ]);
 
    const res = await request(app)
      .patch(`${BASE}/team/captain`)
      .set(auth)
      .send({ captain_id: 999 });
 
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/captain not in team/i);
  });
});
 