-- migrate:up
CREATE TABLE users (
    user_id    SERIAL       NOT NULL,
    username   VARCHAR(50)  NOT NULL,
    email_id   VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (user_id),
    CONSTRAINT users_username_key UNIQUE (username),
    CONSTRAINT users_email_id_key UNIQUE (email_id)
);

-- migrate:down
DROP TABLE IF EXISTS users;
