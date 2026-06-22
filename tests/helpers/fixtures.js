const jwt = require('jsonwebtoken');
 
const makeToken = (userId = 1) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
 
const testUser = { user_id: 1, username: 'testuser', email_id: 'test@example.com' };
const testTeam = { fantasy_team_id: 10, user_id: 1, team_name: 'Test FC' };
 
module.exports = { makeToken, testUser, testTeam };