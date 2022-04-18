create TABLE chats(
    id BIGINT PRIMARY KEY,
    title VARCHAR(256)
);

create TABLE pools(
    id uuid NOT null,
    command VARCHAR(256),
    chat_id BIGINT,

    FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
);

create TABLE pool_data(
    id uuid NOT null,
    question VARCHAR(256),
    answers VARCHAR(256) [],
    options json,

    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES pools (id) ON DELETE CASCADE
);
