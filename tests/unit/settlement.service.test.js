const { mockQuery } = require('../helpers/infra-mocks');
 
const PlayerGameweekStats = require('../../models/PlayerGameweekStats');
const UserGameweekPoints = require('../../models/User_gameweek_points');
const { settleGameweek } = require('../../services/settlement.services');
 
beforeEach(() => jest.clearAllMocks());
 
describe('settleGameweek', () => {
  const gwFinished = { id: 3, is_finished: true };
 
  it('throws a 400 ApiError if the gameweek is not finished yet', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 3, is_finished: false }] });
 
    await expect(settleGameweek(3)).rejects.toMatchObject({ statusCode: 400 });
  });
 
  it("doubles the captain's points when computing final team score", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [gwFinished] })
      .mockResolvedValueOnce({ rows: [{ user_id: 1, fantasy_team_id: 10 }] })
      .mockResolvedValueOnce({ rows: [
        { fantasy_team_id: 10, player_api_id: 301, is_captain: true, is_vice_captain: false },
      ] });
 
    jest.spyOn(PlayerGameweekStats, 'getGameweekStatsForPlayers')
      .mockResolvedValueOnce([{ player_id: 301, minutes: 90, total_points: 10 }]);
 
    const bulkInsertSpy = jest
      .spyOn(UserGameweekPoints, 'bulkInsertUserGameweekPoints')
      .mockResolvedValueOnce(undefined);
 
    const result = await settleGameweek(3);
 
    expect(result.users_settled).toBe(1);
    expect(bulkInsertSpy).toHaveBeenCalledWith([
      expect.objectContaining({ fantasy_team_id: 10, points: 20 }), // 10 * 2
    ]);
  });
 
  it("gives the vice-captain 1.5x when the captain didn't play", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [gwFinished] })
      .mockResolvedValueOnce({ rows: [{ user_id: 1, fantasy_team_id: 10 }] })
      .mockResolvedValueOnce({ rows: [
        { fantasy_team_id: 10, player_api_id: 301, is_captain: true, is_vice_captain: false },
        { fantasy_team_id: 10, player_api_id: 302, is_captain: false, is_vice_captain: true },
      ] });
 
    jest.spyOn(PlayerGameweekStats, 'getGameweekStatsForPlayers')
      .mockResolvedValueOnce([
        { player_id: 301, minutes: 0, total_points: 0 },
        { player_id: 302, minutes: 90, total_points: 8 },
      ]);
 
    const bulkInsertSpy = jest
      .spyOn(UserGameweekPoints, 'bulkInsertUserGameweekPoints')
      .mockResolvedValueOnce(undefined);
 
    await settleGameweek(3);
 
    
    expect(bulkInsertSpy).toHaveBeenCalledWith([
      expect.objectContaining({ points: 12 }),
    ]);
  });
});