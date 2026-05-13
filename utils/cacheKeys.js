module.exports = {
  BOOTSTRAP:            'bootstrap:static',          // TTL: 1hr
  fantasyTeam: (userId) => `fantasy:team:${userId}`, // TTL: 5min
  leaderboard: (gameweek, page, limit) =>
    `leaderboard:${gameweek ?? 'alltime'}:${page}:${limit}`,  // TTL: 5min
};