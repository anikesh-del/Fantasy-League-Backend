-- migrate:up

CREATE TABLE gameweeks (
    id            INTEGER      NOT NULL,
    name          VARCHAR(50)  NOT NULL,
    deadline_time TIMESTAMP    NOT NULL,
    is_current    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_next       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_finished   BOOLEAN      NOT NULL DEFAULT FALSE,
    average_score INTEGER,
    highest_score INTEGER,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT gameweeks_pkey PRIMARY KEY (id)
);

-- business rule indexes (KEEP)
CREATE UNIQUE INDEX idx_gameweeks_one_current 
ON gameweeks (is_current) WHERE is_current = TRUE;

CREATE UNIQUE INDEX idx_gameweeks_one_next    
ON gameweeks (is_next) WHERE is_next = TRUE;

-- migrate:down

DROP INDEX IF EXISTS idx_gameweeks_one_next;
DROP INDEX IF EXISTS idx_gameweeks_one_current;
DROP TABLE IF EXISTS gameweeks;

