---
id: "0a391bef-4471-49e9-acd1-f302a25eb9b2"
title: "Learning React the hard way"
slug: "learning-react-the-hard-way"
date: "2022-03-06"
updated: 1778859900000
description: "My regrets on learning React"
tags: ["web frontend"]
---
## TL;DR
React isn’t reactive
Virtual DOM isn’t fast
React isn’t all about JavaScript
Context API isn’t unsafe
UI library isn’t client side only
[New PHP or the Future](/posts/new-php-or-the-future)
---
I thought React would be as **react****ive** as its name, but it is not.
### JSX
I thought JSX is all about JavaScript thus it’s pretty flexible. You can do cool things like [function as children](https://reactjs.org/docs/jsx-in-depth.html#functions-as-children) that is not possible in html or many other templating languages. Only when I was asked to do certain migration (e.g. angular to react) that involves heavy shuffling of markups did I realize that [html interoperability](https://custom-elements-everywhere.com/libraries/react/results/results.html) sometimes may also be a concern.
### Virtual DOM
I was told that virtual DOM is fast and *real* DOM is slow, but wait, doesn’t virtual DOM operates over real DOM? It turns out it still does and thus why svelte takes a [different approach](https://svelte.dev/blog/virtual-dom-is-pure-overhead). However, *real* DOM never allows you to write declarative UIs.
### Rendering Performance
I thought memoization techniques like `shouldComponentUpdate` , `PureComponent` , `useMemo` etc are good performance tuning techniques to avoid over rendering. But I was not been told that, in fine [grained reactivity](https://dev.to/ryansolid/a-hands-on-introduction-to-fine-grained-reactivity-3ndf) system, manual optimizations don’t always have to exist in the first place. So it becomes a mixed feeling when watching [React w/o memo](https://www.youtube.com/watch?v=lGEMwh32soc).
### Context API
Context API once famous for being an [“experimental” API](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076), causing whatever uses it considered [experimental](https://github.com/ReactTraining/react-broadcast) as well. However, almost all popular libraries in the community had been using it and they seem to be fine still. Might worth noting, even the "non-experimental" version comes with [caveat](https://reactjs.org/docs/context.html#caveats) as well.
### State Management
![](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/b6c1iz852uxxzfbxgbpq.png)
The state management is a myth, and in someway it resembles a lot with the styling solutions in React ecosystem (css-in-js, css modules and plain css etc). I dabbled around with different solutions for a while only to realize that [react-query](https://react-query.tanstack.com/) is more practical for most apps I am working with.
### Functional programming
React reshapes modern web frontend with its declarative UI paradigm ([rethinking best practice](https://www.youtube.com/watch?v=x7cQ3mrcKaY)), and it embraces FP at heart. Stateless components, side effect segregation etc all good stuff. Then you may encounter immutability, and got amazed by the power of it since who doesn't like [time traveling](https://www.youtube.com/watch?v=xsSnOQynTHs) though? Followed by an unstoppable path of learning [immutable.js](https://immutable-js.com/), [immer.js](https://immerjs.github.io/immer/) etc. At the end of day, I finally learned that JavaScript is a [multi-paradigm](https://en.wikipedia.org/wiki/Programming_paradigm#Multi-paradigm) language.
### React Hooks
Hooks are great in terms of composibility but somehow deceitful as well. One thing is that a granular control over how state and effects can be composed for reusability does not mean the same granularity on rendering efficiency. The other thing is, for anyone who has been using it for a while, [stale closure](https://dmitripavlutin.com/react-hooks-stale-closures/) would not be unfamiliar for them.
### Suspense / React Server Component
It does took me a while to understand why spinner waterfall was an issue, especially for people who start their frontend journey in the age of ajax / spa was the “default” way of building modern web apps. Until then I realized how big paradigm shift it is those modern web apps powered by spa frameworks comparing to traditional websites powered by say Rails. This is exactly where those meta frameworks like [next.js](https://nextjs.org/) or [remix](https://remix.run/docs/en/v1) come into play. They exist to bridge the gap or cliff driven by the need of bringing rich interactivity from native apps(i.e. mobile) to web, almost forgot that the web actually speaks html instead of JavaScript.
There are a lot of other aspects to mention, but the learning is still in progress...
After all, those are all just what we call trade-offs right?
---
**Note**
Inspired by [https://learnvimscriptthehardway.stevelosh.com/](https://learnvimscriptthehardway.stevelosh.com/)
