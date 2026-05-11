\restrict dbmate

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: player_position; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.player_position AS ENUM (
    'GKP',
    'DEF',
    'MID',
    'FWD'
);


--
-- Name: squad_position; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.squad_position AS ENUM (
    'GKP',
    'DEF',
    'MID',
    'FWD'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: fantasy_team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fantasy_team (
    fantasy_team_id integer NOT NULL,
    user_id integer,
    team_name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: fantasy_team_fantasy_team_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fantasy_team_fantasy_team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fantasy_team_fantasy_team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fantasy_team_fantasy_team_id_seq OWNED BY public.fantasy_team.fantasy_team_id;


--
-- Name: fantasy_team_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fantasy_team_players (
    fantasy_team_id integer NOT NULL,
    player_api_id integer NOT NULL,
    "position" public.squad_position NOT NULL,
    is_captain boolean DEFAULT false NOT NULL,
    is_vice_captain boolean DEFAULT false NOT NULL,
    CONSTRAINT ftp_captain_not_vice_captain CHECK ((NOT ((is_captain = true) AND (is_vice_captain = true))))
);


--
-- Name: fixtures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fixtures (
    id integer NOT NULL,
    gameweek_id integer,
    home_team_id integer,
    away_team_id integer,
    home_team_score integer,
    away_team_score integer,
    kickoff_time timestamp without time zone,
    finished boolean DEFAULT false NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fixtures_different_teams CHECK ((home_team_id <> away_team_id))
);


--
-- Name: gameweeks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gameweeks (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    deadline_time timestamp without time zone NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    is_next boolean DEFAULT false NOT NULL,
    is_finished boolean DEFAULT false NOT NULL,
    average_score integer,
    highest_score integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: player_gameweek_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.player_gameweek_stats (
    player_id integer NOT NULL,
    gameweek_id integer NOT NULL,
    minutes integer DEFAULT 0 NOT NULL,
    goals integer DEFAULT 0 NOT NULL,
    assists integer DEFAULT 0 NOT NULL,
    clean_sheets integer DEFAULT 0 NOT NULL,
    goals_conceded integer DEFAULT 0 NOT NULL,
    yellow_cards integer DEFAULT 0 NOT NULL,
    red_cards integer DEFAULT 0 NOT NULL,
    saves integer DEFAULT 0 NOT NULL,
    bonus integer DEFAULT 0 NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pgs_bonus_range CHECK (((bonus >= 0) AND (bonus <= 3))),
    CONSTRAINT pgs_minutes_non_negative CHECK ((minutes >= 0)),
    CONSTRAINT pgs_red_cards_max CHECK (((red_cards >= 0) AND (red_cards <= 1))),
    CONSTRAINT pgs_yellow_cards_max CHECK (((yellow_cards >= 0) AND (yellow_cards <= 2)))
);


--
-- Name: players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.players (
    id integer NOT NULL,
    first_name text NOT NULL,
    second_name text NOT NULL,
    web_name text NOT NULL,
    team_id integer NOT NULL,
    "position" public.player_position NOT NULL,
    price numeric(4,1) NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    goals integer DEFAULT 0 NOT NULL,
    assists integer DEFAULT 0 NOT NULL,
    clean_sheets integer DEFAULT 0 NOT NULL,
    minutes integer DEFAULT 0 NOT NULL,
    form numeric(3,1) DEFAULT 0 NOT NULL,
    selected_by_percent numeric(5,2) DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    short_name character varying(10) NOT NULL,
    strength integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_gameweek_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_gameweek_points (
    user_id integer,
    fantasy_team_id integer NOT NULL,
    gameweek integer NOT NULL,
    points integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ugp_gameweek_positive CHECK ((gameweek > 0))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email_id character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login timestamp without time zone
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: fantasy_team fantasy_team_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team ALTER COLUMN fantasy_team_id SET DEFAULT nextval('public.fantasy_team_fantasy_team_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: fantasy_team fantasy_team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team
    ADD CONSTRAINT fantasy_team_pkey PRIMARY KEY (fantasy_team_id);


--
-- Name: fantasy_team_players fantasy_team_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team_players
    ADD CONSTRAINT fantasy_team_players_pkey PRIMARY KEY (fantasy_team_id, player_api_id);


--
-- Name: fantasy_team fantasy_team_user_id_team_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team
    ADD CONSTRAINT fantasy_team_user_id_team_name_key UNIQUE (user_id, team_name);


--
-- Name: fixtures fixtures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_pkey PRIMARY KEY (id);


--
-- Name: gameweeks gameweeks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gameweeks
    ADD CONSTRAINT gameweeks_pkey PRIMARY KEY (id);


--
-- Name: player_gameweek_stats player_gameweek_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_gameweek_stats
    ADD CONSTRAINT player_gameweek_stats_pkey PRIMARY KEY (player_id, gameweek_id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: user_gameweek_points user_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gameweek_points
    ADD CONSTRAINT user_points_pkey PRIMARY KEY (fantasy_team_id, gameweek);


--
-- Name: users users_email_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_id_key UNIQUE (email_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_fantasy_team_players_player_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fantasy_team_players_player_id ON public.fantasy_team_players USING btree (player_api_id);


--
-- Name: idx_fantasy_team_players_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fantasy_team_players_team_id ON public.fantasy_team_players USING btree (fantasy_team_id);


--
-- Name: idx_fantasy_team_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fantasy_team_user_id ON public.fantasy_team USING btree (user_id);


--
-- Name: idx_fixtures_gameweek_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fixtures_gameweek_id ON public.fixtures USING btree (gameweek_id);


--
-- Name: idx_ftp_one_captain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ftp_one_captain ON public.fantasy_team_players USING btree (fantasy_team_id) WHERE (is_captain = true);


--
-- Name: idx_ftp_one_vice_captain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ftp_one_vice_captain ON public.fantasy_team_players USING btree (fantasy_team_id) WHERE (is_vice_captain = true);


--
-- Name: idx_gameweeks_one_current; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_gameweeks_one_current ON public.gameweeks USING btree (is_current) WHERE (is_current = true);


--
-- Name: idx_gameweeks_one_next; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_gameweeks_one_next ON public.gameweeks USING btree (is_next) WHERE (is_next = true);


--
-- Name: idx_player_gameweek_stats_gw; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_player_gameweek_stats_gw ON public.player_gameweek_stats USING btree (gameweek_id);


--
-- Name: idx_player_gameweek_stats_player_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_player_gameweek_stats_player_id ON public.player_gameweek_stats USING btree (player_id);


--
-- Name: idx_players_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_players_team_id ON public.players USING btree (team_id);


--
-- Name: idx_user_gameweek_points_gameweek; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_gameweek_points_gameweek ON public.user_gameweek_points USING btree (gameweek);


--
-- Name: idx_user_gameweek_points_team_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_gameweek_points_team_id ON public.user_gameweek_points USING btree (fantasy_team_id);


--
-- Name: idx_user_gameweek_points_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_gameweek_points_user_id ON public.user_gameweek_points USING btree (user_id);


--
-- Name: fantasy_team fantasy_team_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team
    ADD CONSTRAINT fantasy_team_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fixtures fixtures_away_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fixtures fixtures_gameweek_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_gameweek_id_fkey FOREIGN KEY (gameweek_id) REFERENCES public.gameweeks(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fixtures fixtures_home_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixtures
    ADD CONSTRAINT fixtures_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fantasy_team_players ftp_fantasy_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team_players
    ADD CONSTRAINT ftp_fantasy_team_id_fkey FOREIGN KEY (fantasy_team_id) REFERENCES public.fantasy_team(fantasy_team_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fantasy_team_players ftp_player_api_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fantasy_team_players
    ADD CONSTRAINT ftp_player_api_id_fkey FOREIGN KEY (player_api_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: player_gameweek_stats pgs_gameweek_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_gameweek_stats
    ADD CONSTRAINT pgs_gameweek_id_fkey FOREIGN KEY (gameweek_id) REFERENCES public.gameweeks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: player_gameweek_stats pgs_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.player_gameweek_stats
    ADD CONSTRAINT pgs_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_gameweek_points user_points_fantasy_team_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gameweek_points
    ADD CONSTRAINT user_points_fantasy_team_fkey FOREIGN KEY (fantasy_team_id) REFERENCES public.fantasy_team(fantasy_team_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_gameweek_points user_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gameweek_points
    ADD CONSTRAINT user_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260402202023'),
    ('20260402202638'),
    ('20260402202852'),
    ('20260402202946'),
    ('20260402205427'),
    ('20260402205448'),
    ('20260402205514'),
    ('20260402205630'),
    ('20260402205716'),
    ('20260402205748'),
    ('20260402211718');
