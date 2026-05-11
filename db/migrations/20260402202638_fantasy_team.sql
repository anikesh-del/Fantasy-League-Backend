-- migrate:up
CREATE TABLE fantasy_team (
    fantasy_team_id SERIAL      NOT NULL,
    user_id         INTEGER,
    team_name       VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fantasy_team_pkey PRIMARY KEY (fantasy_team_id),
    CONSTRAINT fantasy_team_user_id_team_name_key UNIQUE (user_id, team_name),
    CONSTRAINT fantasy_team_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- migrate:down
DROP TABLE IF EXISTS fantasy_team;
