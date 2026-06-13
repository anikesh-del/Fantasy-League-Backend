const { getLeaderboard, getLeaderboardCount } = require('../models/User_gameweek_points');

const CacheService = require('./cache.services');
const KEYS = require('../utils/cacheKeys');

async function getLeaderboardServices({ gameweekId, page, limit }) {
  const offset = (page - 1) * limit;

  const key = KEYS.leaderboard(gameweekId, page, limit);

  return CacheService.cacheAside(key, 300, async () => {
    const [entries, total] = await Promise.all([
      getLeaderboard({ gameweekId, limit, offset }),
      getLeaderboardCount({ gameweekId }),
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
  });

}

module.exports = { getLeaderboardServices };