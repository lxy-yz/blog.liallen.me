---
id: "950ecc18-d4f8-4e0f-8e83-a71c356acc56"
title: "State management in React"
slug: "state-management-in-react"
date: "2023-01-24"
updated: 1778947080000
description: ""
tags: ["Technology"]
---
As someone who's been hit by the [JS fatigue](./learning-react-the-hard-way.md) long time ago, I’m trying to keep myself away from off-topic debate between things like `Redux`, `React.Context`.
However, from time to time, I'll still see people mention stuff like [Redux Toolkit](https://redux-toolkit.js.org/). I'll share my 2 cents about state management in React/front-end space so that I don’t repeat myself.

I personally find that there're a lot of nuances — the cliche that "it depends". In fact, it ***is*** tight to the specific application since tools are more context dependent than craft.
For example if it's an old fashioned CRUD-based admin tools, most states could be just data fetched from APIs (with or w/o cache), using Redux is an overkill in this case.

More specifically, I kinda view it as a spectrum:
On one side, it's "Just use React" (think React Router), i.e. `useState`, `useContext` etc. Since it's just part of the component, it's **simple** and it enjoys other benefits (e.g. lazy loading) for free
On the other side, it's "UI agnostic", i.e. Redux, Mobx etc. It's advanced cause it manages data flow (remember that "React is a UI library") w/ great debugging tools. It makes state easier to reason about when app (**complexity**) grows non-linearly.

We need to be cautious about both over-engineering and under-engineering, that's why I think aiming [ETC (easy to change)](https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to) is a gold rule, though very hard in practice.
If asking for more specific suggestions, I think [this](https://jotai.org/docs/basics/comparison)  article (don't attach to the technology itself but its underlying models) offers some good advice.
