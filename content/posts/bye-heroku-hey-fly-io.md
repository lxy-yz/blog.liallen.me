---
id: "d494a5e5-e25b-4efd-9fb7-2e9b43779fd2"
title: "Bye Heroku, hey Fly.io"
slug: "bye-heroku-hey-fly-io"
date: "2022-11-30"
updated: 1778859900000
description: "Migrate datastore for this blog’s comment system"
tags: ["Technology"]
---
I still remember the first time I deployed a database backed website with a single command, it completely blows my mind and the tool made it possible was Heroku. Nowadays when talking about containerization, Docker/k8s gets mentioned a lot, but the real pioneer in that space (PAAS) is Heroku, at least to me. It offloads the burden of provisioning (e.g. bins/libs installation), scaling (e.g. load balancing), dealing with security (e.g. tls/ssl termination) and a lot other chores from programmers, so that they only need to focus on building the app. However, Heroku recently (11/28) cancelled its free plan for all customers. As a result, I did a bit research to look for an alternative and came across another great tool - [fly.io](http://fly.io).
## Background
One practical reason I’m looking for a Heroku alternative is that I’m using its Heroku Postgres service. The comment system of this blog is powered by [https://github.com/djyde/cusdis](https://github.com/djyde/cusdis) thanks to Randy (the creator), self hosted by Vercel (compute) and Heroku Postgres (storage) with a simple comment form widget (iframe) at the bottom of this page. Since it's mostly a quiet blog, the free-tier plan of both services is more than enough for comments.
## Migration Guide
> Embedded: bookmark
Smart move, isn't it?
## Migration Steps
Breaking down into 2 parts, 1) Migrating the data to Fly Postgres 2) Exposing to external connections (i.e. `DB_URL` for above Vercel app to connect).
### Migrating the data to Fly Postgres
1. Provision database app
  ```bash
fly pg create -n "cusdis-db"
  ```
  ```bash
fly secrets set -a cusdis-db DATABASE_URL=postgres://postgres:`password`@cusdis-db.internal:5432
  ```
2. Data transfer
  ```bash
fly secrets set -a cusdis-db HEROKU_DATABASE_URL=$(heroku config:get -a cusdis2 DATABASE_URL)
  ```
  ```bash
fly ssh console -a cusdis-db
createdb --maintenance-db $DATABASE_URL cusdis
pg_dump -Fc --no-acl --no-owner -d $HEROKU_DATABASE_URL | pg_restore --verbose --clean --no-acl --no-owner -d $DATABASE_URL/cusdis
  ```
  ```bash
fly secrets unset HEROKU_DATABASE_URL DATABASE_URL -a cusdis-db
  ```
3. Verify
  ```bash
fly pg connect -a cusdis-db -d cusdis
  ```
### Exposing to external connections
(based on [https://fly.io/docs/postgres/connecting/connecting-external/](https://fly.io/docs/postgres/connecting/connecting-external/))
1. IP allocation
  ```bash
fly ips allocate-v4 -a cusdis-db
  ```
2. Expose external port
  Pull down `fly.toml` configuration file
  > Embedded: alias
  ```bash
fly config save --app cusdis-db
  ```
  Update above configuration file
  ```toml
[[services]]
  internal_port = 5432 # Postgres instance
  protocol = "tcp"
[[services.ports]]
  handlers = []
  port = 10000
  ```
3. Deploy and verify changes
  ```bash
fly deploy -a cusdis-db --image flyio/postgres:14
fly info -a cusdis-db
  ```
### Wrap up
By combining IP and public port above, we should be able to get the database url,  something that looks like `postgres://postgres:`pasword`@`host IPv4 address`:10000/cusdis` . Just replace the old url with this new one and test with a few comments, then we should be 🥂.

Caveats
- New incoming data to Heroku during the migration will be missed (see [https://fly.io/docs/postgres/getting-started/migrate-from-heroku/](https://fly.io/docs/postgres/getting-started/migrate-from-heroku/) for more details)
- Rename. i.e. replace `cusdis-db` appeared in above commands with your own `app-db` name
