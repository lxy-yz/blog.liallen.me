---
id: "8f230d3a-3ba5-4be3-aa2f-8afb290e8ff3"
title: "Shared dev command in monorepo"
slug: "shared-dev-command-in-monorepo"
date: "2022-02-07"
updated: 1778859900000
description: "Typescript monorepo done differently"
tags: ["Technology"]
---
## Context

Given a [Yarn Workspace](https://yarnpkg.com/features/workspaces) with codebase all written in TypeScript
- lib (e.g. a component library)
- lib2, lib3 … (e.g. [lodash](https://lodash.com/) utility library)
- app (e.g. a [CRA](https://create-react-app.dev/docs/getting-started/) app)

In lib, we have
```javascript
import lib2 from “lib2”
import lib3 from “lib3”
```

In app, we have
```javascript
import lib from “lib”
```

A common dev workflow could be
1. work on app
2. notice lib needs update
3. notice lib2 and lib3 need update
4. lib2 and lib3 updated
5. lib updated
6. back to continue working on app

## The Problem

- There are cross dependencies among those workspaces
- The workspaces need to be build in the correct order (i.e. topological order) for app to work properly

Yarn workspace addressed the first problem pretty well but left the second to developers.That's you're likely required to a. run `yarn watch`/`yarn dev` in each workspace b. in a right order.
But can we just use a shared build cycle for all workspaces above?? Just like all those libs are part of the app workspace for development.

## The Trick
Points the `main`/`exports` field in package.json to `src/index.ts` for all libs.

### Caveat
There is clear trade-offs in this approach, this essentially turns monorepo into a single package during local development. But you will still need to figure out how to release/publish those libraries [https://yarnpkg.com/features/workspaces#publishing-workspaces](https://yarnpkg.com/features/workspaces#publishing-workspaces), which is a separate problem to solve.
