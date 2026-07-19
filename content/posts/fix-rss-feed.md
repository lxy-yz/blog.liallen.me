---
id: "fe532aea-1c79-4e27-be92-e22696cc4548"
title: "Fix rss feed"
slug: "fix-rss-feed"
date: "2022-08-26"
updated: 1778859900000
description: ""
tags: ["Technology"]
---
I’ve noticed that there is some issue with this blog’s [RSS ](https://en.wikipedia.org/wiki/RSS)feed, but I haven’t got a chance to look into it. Since my collection of web feeds continue to grow and they all function perfectly, this broken experience becomes increasingly annoying, so I decide to spend some time fixing it.
## Problem
Basically I have noticed two problems

![before fixing the rendering issue](/assets/fix-rss-feed/01-e970e7419d488719-untitled.png)

![after fixing the rendering issue](/assets/fix-rss-feed/02-40c49eee155a49af-untitled.png)

- The feed doesn’t render properly in RSS reader
- The feed doesn’t update (staled) when there is new posts published
## Diagnose Cause
According to wikipedia
> **RSS**  is a [web feed](https://en.wikipedia.org/wiki/Web_feed) that allows users and applications to access updates to websites in a [standardized](https://en.wikipedia.org/wiki/Standardization), computer-readable format.
In order to figure out why the feed isn’t rendering properly, I choose to validate it against the RSS Specific first using [RSS validator](https://www.rssboard.org/rss-validator) to see if there’s any syntax issue. The validation turns out to be fine, so I assume there might be some optional elements (see 👇) missing in my case. I checked the generated feed and noticed that both `content` and `enclosure` are missing.
### [RSS Specification](https://www.rssboard.org/rss-specification)
- Channel elements
  - title (required)
  - description (required)
  - url (required)
  - ttl (optional)
  - pubDate (optional)
  - etc
- Item elements (all optional besides title/description)
  - title
  - description
  - enclosure
  - content (custom element)
  - pubDate
  - etc
## How to fix
To add the missing elements to the feed, I need to figure out how’s the RSS feed gets generated first.
![Tech stack of this blog](/assets/fix-rss-feed/03-60711eb173d4bddd-untitled.png)
This blog is actually a static website powered by [Next.js](https://nextjs.org/) with [Notion](https://www.notion.so/) as data source. Image 👆 gives a glimpse about its tech stack.
Data source are blog posts that made available either through Headless CMS or  Local File System. Since I’m using Notion as a headless CMS, the latest feed of this site can only be derived from accessing the Notion APIs.
### Headless CMS
Data (Posts) made available at **run time **(e.g. pulling from APIs). Publishing new posts will not require new deployment of this site and latest feed can only be fetched from remote API.
### Local File System
Data (Posts) made available at **build time **(e.g. parsing static markup files). Publishing new posts will trigger new deployment of this site and latest feed gets updated as part of the deployment process.
However, since the official [Notion client](https://www.npmjs.com/package/@notionhq/client) doesn’t offer any methods for rendering each post, I need a custom html renderer doing this. I’ve found one that works.
> Embedded: bookmark
```javascript
const { html } = await NotionPageToHtml.convert(`https://notion.so/${pageId}`, { bodyContentOnly: true });
```
But this also hits the [Serverless Function Execution Timeout ](https://vercel.com/docs/concepts/limits/overview#general-limits)of Vercel free tier limit. I end up using some file caching to get around it.
```javascript
const fileCache = path.join(process.cwd(), 'rss.data.json')
const cache = JSON.parse(fs.readFileSync(fileCache, 'utf-8'))

for (const pagePath of Object.keys(siteMap.canonicalPageMap)) {
  // ...
  if (cache[pageId]) {
    feedItems.push(cache[pageId])
    continue
  }
  // ...
  cache[pageId] = feedItem
  feedItems.push(cache[pageId])
}
```

Once the missing elements are being added, the change won’t be immediately live due to the second problem. it’s not hard to guess that is related to caching. There’re two levels of cache worth noticing, one is the \<ttl\>** **sub-element of the above channel element, the other one is the feed endpoint (i.e. /feed of this site) has a`Cache-Control` directive set to  `public, max-age=86400, stale-while-revalidate=86400`. Instead, I reset it to `public, max-age=0, must-revalidate` to disable caching so that all latest posts will be “seen” by RSS readers.
