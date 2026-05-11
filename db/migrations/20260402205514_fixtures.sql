-- migrate:up

CREATE TABLE fixtures (
    id              INTEGER   NOT NULL,
    gameweek_id     INTEGER,
    home_team_id    INTEGER,
    away_team_id    INTEGER,
    home_team_score INTEGER,
    away_team_score INTEGER,
    kickoff_time    TIMESTAMP,
    finished        BOOLEAN   NOT NULL DEFAULT FALSE,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fixtures_pkey PRIMARY KEY (id),
    CONSTRAINT fixtures_gameweek_id_fkey  
        FOREIGN KEY (gameweek_id) REFERENCES gameweeks(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fixtures_home_team_id_fkey 
        FOREIGN KEY (home_team_id) REFERENCES teams(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fixtures_away_team_id_fkey 
        FOREIGN KEY (away_team_id) REFERENCES teams(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fixtures_different_teams 
        CHECK (home_team_id <> away_team_id)
);

-- migrate:down

DROP TABLE IF EXISTS fixtures;

