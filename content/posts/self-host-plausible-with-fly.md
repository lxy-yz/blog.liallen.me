---
id: "507587fa-41d7-4a53-a405-3ae797830b63"
title: "Self host Plausible with Fly"
slug: "self-host-plausible-with-fly"
date: "2022-12-03"
updated: 1778859900000
description: "Plausible.io 💜 Fly.io"
tags: ["Technology"]
---
[Embedded content](https://open.spotify.com/episode/2cOtHxrAgroTAMTSL7Q063?si=c073c6d722c249eb)

> Upgraded to version 2.0 following instructions [here](https://github.com/plausible/analytics/releases/tag/v2.0.0) 2023-08-15

> The latent docker image issue was gone, simply using the latest release tag `plausible@latest` in Dockerfile would work
> City level data is automatically downloaded. Set an env variable `MAXMIND_LICENSE_KEY` before app startup if you need it
> Ran into some Clickhouse connection issue during app boot up, resolved by setting CLICKHOUSE_DATABASE_URL (plausible_events_db) and DATABASE_URL (plausible_db) with their ip v4 addresses

[Plausible.io](http://Plausible.io) is an **open source** alternative to Google Analytics created by some inspiring indie devs. Its vision to be transparent about how website traffic data is handled really separates it apart from other proprietary alternatives. I first came across it from above Indie Hacker Podcast and managed to get it hosted on an EC2 container. However, the AWS bills increased too fast that I had to switch to [Fly.io](http://Fly.io) for cheaper hosting.
## How
By following the rule of “Don’t reinvent the wheel”, I found that similar need was already addressed by others, well summarized in a blog post plus a code repository.
- Blog [https://intever.co/blog/plausible-self-hosted-with-fly](https://intever.co/blog/plausible-self-hosted-with-fly)
- GitHub [https://github.com/intever/plausible-hosting](https://github.com/intever/plausible-hosting)
I basically went through the same process by following the instructions, besides fixing some issues related to outdated information. In addition, I also enabled the [https://github.com/plausible/analytics/pull/1449](https://github.com/plausible/analytics/pull/1449) available in recent release.
## Problems
`details`
#### Plausible deployment failures
  - Caused by under provisioning
    Solution:
    ```bash
fly scale memory 1024
    ```
  - `release_command` in `fly.toml` failed to create and migrate DB
    > I wound up deploying once to create the DB, then again to migrate the DB when the first deploy failed to run.
    Solution:
    1. Update `fly.toml`
      ```diff
- release_command = 'db migrate'
+ release_command = 'db createdb'
      ```
    2. Deploy
    3. Run the migration command
      ```bash
fly ssh console
entrypoint.sh db migrate
      ```

`details`
#### The latest docker image release are behind development (i.e. `master` branch)
  - DB connection issue. Fly.io does all internal networking over IPv6, and that required a Change to how phoenix apps are built. The phx generators have [been updated](https://github.com/phoenixframework/phoenix/commit/380a281bd88a51d002fe567c0652c1cb657e5f9f), but it required a [PR](https://github.com/plausible/analytics/pull/1661) for plausible.
  - The other issue is that I wanted to  `force_ssl` , but that’s a [compile-time configuration](https://hexdocs.pm/phoenix/Phoenix.Endpoint.html#module-compile-time-configuration)
    ```elixir
config :plausible, PlausibleWeb.Endpoint,
  force_ssl: [rewrite_on: [:x_forwarded_proto]],
    ```
  - Missing features like region/city level information
  Solution:
  1. Fork [https://github.com/plausible/analytics](https://github.com/plausible/analytics)
  2. Copy `fly.toml` from the `plausible` directory to the forked `analytics` directory
  3. Deploy change `fly deploy`

## Guides
### Prerequisite
> Embedded: bookmark
Make sure `fly` CLI is installed and is logged in to be able to run other commands
```bash
brew install fly
fly auth login
```
### Postgres DB
`fly pg create plausible-db`
### Clickhouse
1. `cd clickhouse`
2. `fly apps create plausible_clickhouse`
3. `fly vol create plausible_clickhouse_data`
4. `fly deploy`
### Plausible (Analytics)
1. `cd plausible`
2. `fly apps create plausible`
3. `fly pg attach plausible-db`
4. Set secrets
  ```bash
openssl rand -base64 64 | tr -d '\n' ; echo
fly secrets set SECRET_KEY_BASE=`FROM ABOVE` \
    ADMIN_USER_NAME=`username` \
    ADMIN_USER_EMAIL=`email` \
    ADMIN_USER_PWD=`password` \
    BASE_URL=`host_url`
  ```
5. `fly scale memory 1024` scale up to avoid under provision
### Add Cities Level Data
Based on [https://github.com/plausible/analytics/discussions/2324](https://github.com/plausible/analytics/discussions/2324)
1. `cd plausible`
2. Create a volume for geo data
  `fly vol create myapp_data`
  ```shell
# fly.toml
[mounts]
source="myapp_data"
destination="/data"
  ```
3. Download `geonames.csv` & `geolite2-city.mmdb` to the container
  1. `fly ssh console`
  2. `cd /data`
  ```bash
# geonames.csv
wget https://s3.eu-central-1.wasabisys.com/plausible-application/geonames.csv

# geolite2-city.mmdb
export MAXMIND_LICENSE_KEY=LNpsJCCKPis6XvBP # replace this with your own
wget "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" -O geolite2-city.mmdb.gz
gunzip geolite2-city.mmdb.gz
  ```
4. Set Secrets to the data location
  ```bash
fly secrets set IP_GEOLOCATION_DB='/data/geolite2-city.mmdb' GEONAMES_SOURCE_FILE='/data/geonames.csv'
  ```
### [DNS Entries / SSL](https://fly.io/docs/app-guides/custom-domains-with-fly/)
```bash
fly certs create `BASE_URL`
```

---

Note:
`details`
#### Self host on EC2 guide
  1. Bootstrap an EC2 Ubuntu instance (e.g. t2.medium, \> 2G RAM) w/ security group inbound rules configured
    - HTTP 80
    - HTTPS 443
  2. Install Nginx [https://ubuntu.com/tutorials/install-and-configure-nginx](https://ubuntu.com/tutorials/install-and-configure-nginx)
  3. Install Docker & Docker Compose for Ubuntu
    1. [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)
    2. [https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)
  4. Installing Certbot according to the EFF [https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)
  5. Continue with [https://plausible.io/docs/self-hosting#up-and-running](https://plausible.io/docs/self-hosting#up-and-running)
