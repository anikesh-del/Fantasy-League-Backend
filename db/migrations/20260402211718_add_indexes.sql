-- migrate:up
CREATE INDEX idx_fantasy_team_user_id            ON fantasy_team(user_id);
CREATE INDEX idx_fantasy_team_players_team_id    ON fantasy_team_players(fantasy_team_id);
CREATE INDEX idx_fantasy_team_players_player_id  ON fantasy_team_players(player_api_id);
CREATE INDEX idx_player_gameweek_stats_gw        ON player_gameweek_stats(gameweek_id);
CREATE INDEX idx_player_gameweek_stats_player_id ON player_gameweek_stats(player_id);      -- ← added
CREATE INDEX idx_user_gameweek_points_user_id    ON user_gameweek_points(user_id);
CREATE INDEX idx_user_gameweek_points_gameweek   ON user_gameweek_points(gameweek);
CREATE INDEX idx_user_gameweek_points_team_id    ON user_gameweek_points(fantasy_team_id); -- ← added
CREATE INDEX idx_fixtures_gameweek_id            ON fixtures(gameweek_id);
CREATE INDEX idx_players_team_id                 ON players(team_id);

-- migrate:down
DROP INDEX IF EXISTS idx_fantasy_team_user_id;
DROP INDEX IF EXISTS idx_fantasy_team_players_team_id;
DROP INDEX IF EXISTS idx_fantasy_team_players_player_id;
DROP INDEX IF EXISTS idx_player_gameweek_stats_gw;
DROP INDEX IF EXISTS idx_player_gameweek_stats_player_id;  -- ← added
DROP INDEX IF EXISTS idx_user_gameweek_points_user_id;
DROP INDEX IF EXISTS idx_user_gameweek_points_gameweek;
DROP INDEX IF EXISTS idx_user_gameweek_points_team_id;     -- ← added
DROP INDEX IF EXISTS idx_fixtures_gameweek_id;
DROP INDEX IF EXISTS idx_players_team_id;

