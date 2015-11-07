## Appcaster

Appcaster is a release manager.  It can be used to upload builds, organise them into channels, and then release them to users.

### API documentation

The Appcaster documentation can be found in the [Appcaster GitHub wiki](https://github.com/mekentosj/appcaster/wiki).

Seed database with:

```c
CREATE TABLE apps (
id serial PRIMARY KEY,
url_slug varchar (20) NOT NULL CHECK (url_slug <> '') UNIQUE,
name varchar (100) NOT NULL CHECK (name <> '')
);

CREATE TABLE channels (
id serial PRIMARY KEY,
app_id int references apps(id) ON DELETE CASCADE,
url_slug varchar (30) NOT NULL CHECK (url_slug <> ''),
title varchar (200) NOT NULL,
language varchar (10) NOT NULL,
platform varchar (20) NOT NULL,
description text NOT NULL
);

CREATE TABLE builds (
id serial PRIMARY KEY,
app_id int references apps(id) ON DELETE CASCADE NOT NULL,
title varchar (100) NOT NULL CHECK (title <> ''),
filename varchar (100) NOT NULL CHECK (filename <> ''),
identifier varchar (100) NOT NULL CHECK (identifier <> ''),
version varchar (20) NOT NULL CHECK (version <> ''), CONSTRAINT unique_version_and_app UNIQUE (app_id, version),
version_string varchar (100),
minimum_system_version varchar (20),
length bigint NOT NULL,
download_url varchar (255),
signature varchar (100) NOT NULL CHECK (signature <> ''),
publication_date timestamp DEFAULT CURRENT_TIMESTAMP,
download_limit int DEFAULT 0,
downloads int DEFAULT 0,
notes text
);

CREATE TABLE clients (
id serial PRIMARY KEY,
name varchar(100) NOT NULL CHECK (name <> '') UNIQUE,
hashed_password varchar(100) NOT NULL CHECK (hashed_password <> '')
);

CREATE TABLE releases (
id serial PRIMARY KEY,
build_id int references builds(id) ON DELETE CASCADE,
channel_id int references channels(id) ON DELETE CASCADE,
created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```
