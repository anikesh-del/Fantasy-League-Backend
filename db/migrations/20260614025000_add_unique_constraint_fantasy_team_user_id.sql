-- migrate:up
ALTER TABLE fantasy_team ADD CONSTRAINT fantasy_team_one_per_user UNIQUE (user_id);

-- migrate:down
ALTER TABLE fantasy_team DROP CONSTRAINT fantasy_team_one_per_user;

