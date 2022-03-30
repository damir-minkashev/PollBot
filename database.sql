create TABLE chats(
    id INTEGER PRIMARY KEY,
    title VARCHAR(256)
);
create TABLE pools(
    id uuid NOT null,
    command VARCHAR(256),
    chat_id INTEGER,

    FOREIGN KEY (chat_id) REFERENCES chats (id)
);

create TABLE pool_content(
    id uuid NOT null,
    question VARCHAR(256),
    answers VARCHAR(256) [],
    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES pools (id)
);
