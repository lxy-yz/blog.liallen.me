# Blog

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

Comments are wired for Giscus, which uses GitHub Discussions and works on free static hosting. This repo is preconfigured to use `lxy-yz/blog.liallen.me` with the `General` discussion category.

1. Create or choose a public GitHub repo for comments.
2. Enable Discussions in that repo.
3. Install the Giscus GitHub app for the repo.
4. Use `https://giscus.app` to get these values if you want to override the built-in defaults with hosting environment variables:

```sh
GISCUS_REPO=lxy-yz/blog.liallen.me
GISCUS_REPO_ID=R_kgDOTWz0SA
GISCUS_CATEGORY=General
GISCUS_CATEGORY_ID=DIC_kwDOTWz0SM4DBFid
SITE_URL=https://blog.liallen.me
```

If the Giscus values are removed from both code defaults and environment variables, each post shows a small setup note instead of a broken comment widget.
