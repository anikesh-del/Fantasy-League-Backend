-- migrate:up

CREATE TABLE teams (
    id          INTEGER         NOT NULL,
    name        VARCHAR(100)    NOT NULL,
    short_name  VARCHAR(10)     NOT NULL,
    strength    INTEGER,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT teams_pkey PRIMARY KEY (id)
);

-- migrate:down

DROP TABLE IF EXISTS teams;

