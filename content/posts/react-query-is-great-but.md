---
id: "35371196-89ae-4973-b2ec-58c12a124dbc"
title: "React Query is great but..."
slug: "react-query-is-great-but"
date: "2022-01-10"
updated: 1778859900000
description: "single page apps could be done better"
tags: ["Technology"]
---
### Background
There is an over-hype of Redux for modern front-end apps. Famous as [https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) don’t stop team from adopting tools w/o understanding the problem they try to solve first. This is just one side of the spectrum, the other side of it is [https://blog.isquaredsoftware.com/2018/03/redux-not-dead-yet/](https://blog.isquaredsoftware.com/2018/03/redux-not-dead-yet/). React Query is great partly cause it didn't fall into the trap of either side of the spectrum.
### The Problem
The problem should always be focusing on how to create better UIs. React shed light on how declarative state-driven UIs look like. But the paradigm shift from server side routing and rendering to client side comes with huge cost.
Loading experience with spinner waterfalls is just one of the very noticeable ones. Also known as “fetch on render” [https://reactjs.org/docs/concurrent-mode-suspense.html#approach-1-fetch-on-render-not-using-suspense](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-1-fetch-on-render-not-using-suspense). To deal with it, the community tried with Redux, React Context and React Query etc.
React Context is about state sharing among components. Redux is about data flow (i.e. Flux/Elm Architecture). React Query is about data caching and validation. React Query stays closer to the problem domain. To improve the data loading experience, we simply need to minimize unnecessary network round-trips w/o serving stale data. With the help of caching, a lot of spinners can be gone. But unfortunately it’s still based on the “fetch on render” model.
### What’s next then
Ideally this could be solved at the framework level with better API primitives, assuming this is what React Suspense was aiming towards. Before that could happen, meta frameworks like Next.js, Nuxt.js or Svelte.kit are the best bets at the moment. All based on the premise that route’s data can be prefetched on server. Front end tools are gradually becoming more mature now, thus a lot of good reasons to be optimistic about better solutions will arise. Before that day comes, let’s just brush up some old progressive enhancement techniques from Remix [https://remix.run/docs/en/v1/pages/philosophy#progressive-enhancement](https://remix.run/docs/en/v1/pages/philosophy#progressive-enhancement).

---

[Embedded video](https://www.youtube.com/watch?v=u2WtILkz0fI)
