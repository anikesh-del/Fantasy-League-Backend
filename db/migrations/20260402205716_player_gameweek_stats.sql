-- migrate:up

CREATE TABLE player_gameweek_stats (
    player_id      INTEGER   NOT NULL,
    gameweek_id    INTEGER   NOT NULL,
    minutes        INTEGER   NOT NULL DEFAULT 0,
    goals          INTEGER   NOT NULL DEFAULT 0,
    assists        INTEGER   NOT NULL DEFAULT 0,
    clean_sheets   INTEGER   NOT NULL DEFAULT 0,
    goals_conceded INTEGER   NOT NULL DEFAULT 0,
    yellow_cards   INTEGER   NOT NULL DEFAULT 0,
    red_cards      INTEGER   NOT NULL DEFAULT 0,
    saves          INTEGER   NOT NULL DEFAULT 0,
    bonus          INTEGER   NOT NULL DEFAULT 0,
    total_points   INTEGER   NOT NULL DEFAULT 0,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT player_gameweek_stats_pkey 
        PRIMARY KEY (player_id, gameweek_id),
    CONSTRAINT pgs_player_id_fkey 
        FOREIGN KEY (player_id) REFERENCES players(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pgs_gameweek_id_fkey 
        FOREIGN KEY (gameweek_id) REFERENCES gameweeks(id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pgs_minutes_non_negative CHECK (minutes >= 0),
    CONSTRAINT pgs_yellow_cards_max CHECK (yellow_cards BETWEEN 0 AND 2),
    CONSTRAINT pgs_red_cards_max CHECK (red_cards BETWEEN 0 AND 1),
    CONSTRAINT pgs_bonus_range CHECK (bonus BETWEEN 0 AND 3)
);

-- migrate:down

DROP TABLE IF EXISTS player_gameweek_stats;

