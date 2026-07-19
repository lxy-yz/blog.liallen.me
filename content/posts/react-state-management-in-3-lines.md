---
id: "f0411b5b-39ad-4495-ad68-62446d42e23a"
title: "React state management in 3 lines"
slug: "react-state-management-in-3-lines"
date: "2023-09-06"
updated: 1778946960000
description: ""
tags: ["web frontend"]
---

> I talked about my mental model about state management in React in previous [post](/950ecc18d4f84e0f8e83a71c356acc56?pvs=25), this post is an implementation about that.

## TL;DR
1. `npm install unstated-next immer use-immer`
2. create a `store.ts` file with 3 lines of code (👇)
3. 🎉🎉🎉
```typescript
// store.ts
import { createContainer } from 'unstated-next'
import { useImmer } from 'use-immer'
export default createContainer(state => useImmer(state))
```

---
## Problem
Have you ever experienced analysis paralysis in the world of React while trying to understand what [The Paradox of Choices](https://en.wikipedia.org/wiki/The_Paradox_of_Choice) means?

The fact that React is so unopinionated that it offloads the burden of having strong opinions onto you, the developer, who is responsible for building something more than a "Hello World" demo.

Every day, a new state management solution emerges, such as Redux, Mobx, React.Context, Jotai, Zustand, you name it. Each has its distinct features, which is why there are numerous online tutorials about them.

However, the question remains: which one should we choose if we want to simply Get Stuff Done instead of getting stuck in an endless comparison rabbit holes?

## Inspiration
If we can suspend our judgement temporarily and let go of the pride of winning the popularity contest for a moment, we may find something quite pragmatic from our peer frameworks.

And of course, we will. There will always be inspirations to draw from others, similar to how they learn from React.

In Vue 3, there is a new Composition API paired with Immer.js that literally turns Vue into React. See how Evan weaves his magic in just a few lines of code.

    ```typescript
const { state: items, update } = useImmer([
  {
     title: "Learn Vue",
     done: true
  },
  {
     title: "Use Vue with Immer",
     done: false
  }
])
    ```

    > Embedded: tweet

Although it looks simple and clean, it doesn't provide much of a selling point to me because Vue and Immer.js have many similarities in terms of state mutations, especially from a *developer *point of view.

They both allow us to update state in a way that's similar to how we **mutate** JavaScript objects, without working against the JavaScript language.

But how about React? Could it be possible to bring the same idea to React and make React more Vue-ish?

## Solution
Turns out, it's not that difficult to achieve (you only need 2 libaries  +  ). It has the same benefit of using React.Context, unlike hooks, state can be shared across components. What is more is that it enhances React.Context with Immer so that you can update state just like you’re mutating object in JavaScript.

Additionally, it enhances React.Context with Immer, allowing you to update state just like you would mutate an object in JavaScript. Think of it as replacing React's `setState` with Immer's `update` function, while everything else remains the same.

    ```typescript
import store from './store'

// useContainer is a React hook from https://github.com/jamiebuilds/unstated-next
const [ state: items, update ] = store.useConatiner([
  {
     title: "Learn React",
     done: true
  },
  {
     title: "Use React with Immer",
     done: false
  }
])
    ```

    > Embedded: tweet

Embrace simplicity by not fighting against the language.
Boost productivity by avoiding decision-making.
Easy peasy.

Thanks for reading.
Until next time 👋
