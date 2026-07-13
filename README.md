# Blog Migration

This repo uses Notion as the CMS for `https://blog.liallen.me/`.

The site does not crawl the live blog URL. Content is synced from the Notion API into `data/notion-cms.json`, and the app renders that generated cache.

## Notion CMS

The source data source is:

```sh
NOTION_DATA_SOURCE_ID=eb6eb762-fc74-4201-bf9b-5727a50256d2
```

Create a Notion internal connection with read-content access, share the `All posts` database with that connection, then set:

```sh
NOTION_TOKEN=secret_...
NOTION_DATA_SOURCE_ID=eb6eb762-fc74-4201-bf9b-5727a50256d2
NOTION_VERSION=2026-03-11
```

Refresh the local CMS cache:

```sh
npm run sync:notion
```

`npm run build` runs the sync in optional mode. If `NOTION_TOKEN` is present it refreshes from Notion; otherwise it regenerates from the checked-in cache so local builds still work.

## Local preview

```sh
npm run build
npm run dev
```

Open `http://localhost:5173`.

## Free hosting

Recommended: Cloudflare Pages.

- Build command: `npm run build`
- Output directory: `dist`
- Custom domain: point `blog.liallen.me` to the Pages project in Cloudflare DNS.

GitHub Pages and Netlify also work because the generated output is plain static HTML.

## Comments

Comments are wired for Giscus, which uses GitHub Discussions and works on free static hosting.

1. Create or choose a public GitHub repo for comments.
2. Enable Discussions in that repo.
3. Install the Giscus GitHub app for the repo.
4. Use `https://giscus.app` to get these values and add them as hosting environment variables:

```sh
GISCUS_REPO=owner/repo
GISCUS_REPO_ID=...
GISCUS_CATEGORY=Comments
GISCUS_CATEGORY_ID=...
SITE_URL=https://blog.liallen.me
```

If these variables are missing, each post shows a small setup note instead of a broken comment widget.
