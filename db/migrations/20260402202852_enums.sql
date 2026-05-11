-- migrate:up
CREATE TYPE player_position AS ENUM ('GKP', 'DEF', 'MID', 'FWD');

CREATE TYPE squad_position AS ENUM (
    'GKP', 'DEF', 'MID', 'FWD'
);

-- migrate:down
DROP TYPE IF EXISTS squad_position;
DROP TYPE IF EXISTS player_position;
