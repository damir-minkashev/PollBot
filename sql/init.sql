-- ...
-- create database gimme;
-- ...
--
-- ...
-- SELECT gimme FROM pg_database;
-- ...

...
create TABLE IF NOT EXISTS chats(
    id BIGINT PRIMARY KEY,
    title VARCHAR(256)
);
...

...
create TABLE IF NOT EXISTS pools(
    id uuid NOT null,
    command VARCHAR(256),
    chat_id BIGINT,

    FOREIGN KEY (chat_id) REFERENCES chats (id)
);
...

...
create TABLE IF NOT EXISTS pool_data(
    id uuid NOT null,
    question VARCHAR(256),
    answers VARCHAR(256) [],
    options json,

    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES pools (id) ON DELETE CASCADE
);
...
