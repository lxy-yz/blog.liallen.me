# Blog Migration

This repo migrates `https://blog.liallen.me/` from a public Notion site into a zero-dependency static blog.

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
