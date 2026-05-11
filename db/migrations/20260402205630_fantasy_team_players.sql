-- migrate:up

CREATE TABLE fantasy_team_players (
    fantasy_team_id INTEGER        NOT NULL,
    player_api_id   INTEGER        NOT NULL,
    position        squad_position NOT NULL,
    is_captain      BOOLEAN        NOT NULL DEFAULT FALSE,
    is_vice_captain BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT fantasy_team_players_pkey 
        PRIMARY KEY (fantasy_team_id, player_api_id),
    CONSTRAINT ftp_fantasy_team_id_fkey 
        FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_team(fantasy_team_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT ftp_player_api_id_fkey 
        FOREIGN KEY (player_api_id) REFERENCES players(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ftp_captain_not_vice_captain 
        CHECK (NOT (is_captain = TRUE AND is_vice_captain = TRUE))
);

-- business rule indexes (KEEP)
CREATE UNIQUE INDEX idx_ftp_one_captain       
ON fantasy_team_players (fantasy_team_id) 
WHERE is_captain = TRUE;

CREATE UNIQUE INDEX idx_ftp_one_vice_captain  
ON fantasy_team_players (fantasy_team_id) 
WHERE is_vice_captain = TRUE;

-- migrate:down

DROP INDEX IF EXISTS idx_ftp_one_vice_captain;
DROP INDEX IF EXISTS idx_ftp_one_captain;
DROP TABLE IF EXISTS fantasy_team_players;

