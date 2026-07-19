---
id: "18df1676-d190-4a97-9e3d-55807508e6c1"
title: "State of modern web"
slug: "state-of-modern-web"
date: "2021-12-05"
updated: 1725671640000
description: "The current landscape of web frontend tooling"
tags: ["web frontend"]
---
## The problem
`SPA` and frameworks were born in correspondence to building websites similar to native apps (the rise of mobile). The unseen emphasis on rich user interactivity pushes the existing web platform to its boundary.
SPAs are kinda broken if without server side rendering. Just think about what those sites might look like after disabling JS. Deferred rendering from server to client creates network waterfalls(may visually represented as spinners) that results in junky user experiences though accepted or even ignored by most people including engineers. Frontend tools got more complicated than ever to fight with the platform and to mitigate the ever growing bloated JS issue.
Traditional websites are `HTML` centric, that is websites are simply documents linked to each other, with `CSS` and `JS` used for progressive enhancement only.
Transitioning from a document centric approach towards modern web apps not only requires the JS(tools and frameworks) to catch up, more importantly, the underlying platform(browser) needs to be ready(`ESM`, `HTTP2`, `WebSocket` etc) as well.
This is essentially a shifting of paradigm from server to client in order to fulfill the business quests at cost of breaking the web.
## The current landscape (2021)
`ES Module`(with import maps) landed in both browser and node. Bundle-less tools like `Vite`/`Snowpack`(2020) were born.
IE finally reaches EOL. Major browser vendors have built in support for modern JS and fundamental protocols like HTTP2, WebSocket etc.
Frontend frameworks start to unify, with `React`, `Vue` and `Angular` dominate the market, while `Svelte` became a breeze of fresh air that validates compiler is the new frontend framework idea by Tom Dale. Won’t really go wrong with any of above due to a lot of conceptual similarities among all of them (e.g. declarative rendering, data flow etc). `React Suspense` and `Server Component` is leading the innovation of this space. Essentially these are “official” attempts to answer above SPA bottleneck issues. This is a real hard problem baked into the SPA model, but it’s hopeful by creating clear boundary between server & client at the framework level, similar to how async rendering enables Suspense.
Meta frameworks began to mature. Rich Harris coined them as “transitional apps”. This is huge due to they are built on top of above maturing frameworks. `Next.js`, `Remix`, `Nuxt`, `Svelte Kit` etc will bridge the gap between `MPA` and `SPA`. Most of them have built in support for `SSG`, `SSR` or `SPA` mode. Rails for frontend might be coming, which may finally unlock the productivity boost.
Server side exploration of building interactive real-time web apps was taken place in the meantime. `Phoenix LiveView` built on top of its Phoenix Channel and WebSocket led the innovation. `Rails Hotwire` took a similar approach, followed by `Livewire` in `Laravel`. Would be fun to see how far this model could be pushed through in production.
Frontend tools got 10-100x folds of performance improvements due to moving from node.js to native code. It starts from esbuild written in Go, sparking the trend of rewriting build tools in frontend with `Rust`/`Go`. Rust was a natural fit for next era frontend tools due to its interoperability with web assembly.
Serverless and JAMStack is gaining more attractions than ever. Static sites are easy to scale thanks to CDNs. `Cloudflare workers` offers similar capabilities but for apis, it even eliminates the known cold start problem of traditional serverless solutions. Cloud deployment providers like `Vercel`, `Netlify`, AWS, Google etc makes continuous delivery only one step away from git push.
## The promising future
While Web 3.0 might still be a myth filled with hype and distractions. We have enough reasons(☝️) to be excited about the coming decade of a better Web 2.0.
### References
- Progressive enhancement [https://en.wikipedia.org/wiki/Progressive_enhancement](https://en.wikipedia.org/wiki/Progressive_enhancement)
- Import map [https://www.digitalocean.com/community/tutorials/how-to-dynamically-import-javascript-with-import-maps](https://www.digitalocean.com/community/tutorials/how-to-dynamically-import-javascript-with-import-maps)
- Rails7 drops webpacker [https://world.hey.com/dhh/modern-web-apps-without-javascript-bundling-or-transpiling-a20f2755](https://world.hey.com/dhh/modern-web-apps-without-javascript-bundling-or-transpiling-a20f2755)
- Compilers are the new framework [https://tomdale.net/2017/09/compilers-are-the-new-frameworks/](https://tomdale.net/2017/09/compilers-are-the-new-frameworks/)
- Transitional apps [https://www.reddit.com/r/sveltejs/comments/q30rs6/rich_harris_transitional_apps_jamstack_conf_2021/](https://www.reddit.com/r/sveltejs/comments/q30rs6/rich_harris_transitional_apps_jamstack_conf_2021/)
- Phoenix LiveView [https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript)
- Rust is the future of frontend infrastructure [https://leerob.io/blog/rust](https://leerob.io/blog/rust)
