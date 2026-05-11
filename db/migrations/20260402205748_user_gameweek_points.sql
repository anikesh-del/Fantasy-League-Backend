-- migrate:up

CREATE TABLE user_gameweek_points (
    user_id         INTEGER,
    fantasy_team_id INTEGER   NOT NULL,
    gameweek        INTEGER   NOT NULL,
    points          INTEGER   NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_points_pkey 
        PRIMARY KEY (fantasy_team_id, gameweek),
    CONSTRAINT user_points_fantasy_team_fkey 
        FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_team(fantasy_team_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT user_points_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT ugp_gameweek_positive CHECK (gameweek > 0)
);

-- migrate:down

DROP TABLE IF EXISTS user_gameweek_points;

