const {getLeaderboard , getLeaderboardCount}=require('../models/User_gameweek_points');

const APIError=require('../errors/ApiError');

async function getLeaderboardServices({gameweekId, page , limit}){
    const offset=(page-1)*limit;

    const [entries, total]=await Promise.all([
        getLEaderboard({gameweekId, limit , offset}),
        getLeaderboardCount({gameweekId}),
    ]);

    return {
    meta: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
      gameweek: gameweekId ?? 'all-time',
    },
    leaderboard: entries,
  };
}

module.exports={getLeaderboardServices};