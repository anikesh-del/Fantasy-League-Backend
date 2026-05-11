-- migrate:up

CREATE TABLE players (
    id                  INTEGER         NOT NULL,
    first_name          TEXT            NOT NULL,
    second_name         TEXT            NOT NULL,
    web_name            TEXT            NOT NULL,
    team_id             INTEGER         NOT NULL,
    position            player_position NOT NULL,
    price               NUMERIC(4,1)    NOT NULL,
    total_points        INTEGER         NOT NULL DEFAULT 0,
    goals               INTEGER         NOT NULL DEFAULT 0,
    assists             INTEGER         NOT NULL DEFAULT 0,
    clean_sheets        INTEGER         NOT NULL DEFAULT 0,
    minutes             INTEGER         NOT NULL DEFAULT 0,
    form                NUMERIC(3,1)    NOT NULL DEFAULT 0,
    selected_by_percent NUMERIC(5,2)    NOT NULL DEFAULT 0,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT players_pkey PRIMARY KEY (id),
    CONSTRAINT players_team_id_fkey 
        FOREIGN KEY (team_id) REFERENCES teams(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- migrate:down

DROP TABLE IF EXISTS players;

