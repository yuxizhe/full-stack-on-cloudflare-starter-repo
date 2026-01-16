PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE links (
        link_id text PRIMARY KEY NOT NULL,
        account_id text NOT NULL,
    destinations TEXT NOT NULL,
        created numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        updated numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
        name text NOT NULL
);
CREATE TABLE destination_evaluations (
        id text PRIMARY KEY,
        link_id text NOT NULL,
        account_id text NOT NULL,
        destination_url text NOT NULL,
        status text NOT NULL,
        reason text NOT NULL,
        created_at numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
CREATE TABLE link_clicks (
        id text NOT NULL,
        account_id text NOT NULL,
        country text,
        destination text NOT NULL,
        clicked_time numeric NOT NULL,
        latitude real,
        longitude real
);
CREATE INDEX idx_link_clicks_id ON link_clicks (id);
CREATE INDEX idx_link_clicks_account_id ON link_clicks (account_id);
CREATE INDEX idx_link_clicks_clicked_time ON link_clicks (clicked_time);
CREATE INDEX idx_destination_evaluations_account_time ON destination_evaluations (account_id,created_at);
