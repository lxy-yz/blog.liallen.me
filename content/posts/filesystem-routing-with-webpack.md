---
id: "02fb7eb4-a350-44ac-a1bf-fd7884f9ab96"
title: "Filesystem routing with webpack"
slug: "filesystem-routing-with-webpack"
date: "2022-03-18"
updated: 1778859900000
description: "Webpack plugin for next.js style routes"
tags: ["Technology"]
---

> [https://github.com/lxy-yz/webpack-fs-routes-plugin](https://github.com/lxy-yz/webpack-fs-routes-plugin) = [https://github.com/hannoeru/vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) + [https://github.com/unjs/unplugin](https://github.com/unjs/unplugin)

Next.js has popularized the idea of [file-system routing](https://nextjs.org/docs/routing/introduction) in the front-end space, though not a particularly new idea, it’s well adopted by the community and other meta frameworks (e.g.  Remix.js). Next.js achieved this with its own router (i.e. `next/router`) which is inseparable from the framework itself. However, for apps built with React Router and Webpack, how can we have something similar?

A quick answer is to reverse engineer it. The end state is something everyone is already familiar with
```typescript
import { Routes, Route } from "react-router-dom";
import Home from '../pages/index'
import About from '../pages/about'
import NoMatch from '../pages/404'

`Routes`
  `<Route path="/">`
    `<Route index element={<Home />`} />
    `<Route path="about" element={<About />`} />
    `<Route path="*" element={<NoMatch />`} />
  `<Route>`
`<Routes>`
```
We may just create it, and it’s in fact what we’ve done before, but it defeats the whole purpose of having the file-system based routes in the first place. Hence, it should be auto generated from a bunch of route files that may looks like this
```typescript
pages/
  index.tsx
  about.tsx
  404.tsx
```
Then the question becomes how can we auto generate the above routes tree from individual route file that follows specific naming conventions?  [https://github.com/hannoeru/vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) does exactly this.

It’s great that we don’t have to reinvent the wheel. However, isn’t it a plugin designed for [Vite](https://vitejs.dev/), is it possible to port a Vite plugin to Webpack? 👋  to [https://github.com/unjs/unplugin](https://github.com/unjs/unplugin).

In short, we can get a Webpack plugin that supports file-system based routing with React Router by **remixing two existing solutions **like 🔝.
> Embedded: copy_indicator

Feel free to poke around with the idea, or roll out your own solutions 🥂
