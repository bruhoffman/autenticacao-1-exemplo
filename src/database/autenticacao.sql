-- Active: 1727713561225@@127.0.0.1@3306
CREATE TABLE users (
    id TEXT PRIMARY KEY UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (DATETIME()) NOT NULL
);

INSERT INTO
    users (
        id,
        name,
        email,
        password,
        role
    )
    --'fulano123',
VALUES (
        'u001',
        'Fulano',
        'fulano@email.com',
        '$2a$12$.5lcDzkGIqnx0fnqAnXqjuvYIdv37KTPSHXH1l4NmHDxMhS5YAWJa',
        'NORMAL'
    ),
    --'beltrana00',
    (
        'u002',
        'Beltrana',
        'beltrana@email.com',
        "$2a$12$470s6hrVv.AGVvNRq4zck.XARmrBty/3hGnQCe41zlyizkyO5b.GC",
        'NORMAL'
    ),
    --'astrodev99',
    (
        'u003',
        'Astrodev',
        'astrodev@email.com',
        "$2a$12$xb3jIzWchtLwCd2faDZBh.wH5pEPTKkcxcHPKTjYjZn6k8P33wTdm",
        'ADMIN'
    );