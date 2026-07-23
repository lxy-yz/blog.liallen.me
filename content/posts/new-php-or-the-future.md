---
id: "963850ed-2fed-46c6-b55b-75de00c3d05d"
title: "New PHP or the Future"
slug: "new-php-or-the-future"
date: "2022-11-19"
updated: 1778859900000
description: ""
tags: ["Technology"]
---
> Embedded: bookmark

The recent [release](https://nextjs.org/blog/next-13) of Next.js 13, mixed with a lot of hype and promotions, has sparked an interesting [discussion](./new-php-or-the-future.md) about the trend of reviving PHP programming in modern web development. It all starts with its file-system based routing which is directly influenced by PHP, till the recent support of [React Server Component](https://beta.nextjs.org/docs/data-fetching/fundamentals#fetching-data-with-server-components) and [Streaming](https://beta.nextjs.org/docs/data-fetching/streaming-and-suspense) as continuous refinements to its SSR capability and commitments to better user experience. When looking at the landscape of React, what Next.js has done to the ecosystem and the new possibilities it unlocks are beyond impressive. But in the meanwhile, all the hypes may seem nothing besides confusing for web devs who primarily work with traditional web frameworks that come with similar features out of box. Especially when taking [Lindy Effect](https://en.wikipedia.org/wiki/Lindy_effect) into account.

    > Embedded: tweet

    > Embedded: tweet

It’s fair to argue that there’re clear [nuances](https://twitter.com/karlhorky/status/1585937245172736000?s=61&t=KWTU7sI1mqDL_GMQZHHPiA) between those technologies, just like all technologies come with trade offs, not to mention the different run time (server vs client) environment they’re targeting at. But it’s also hard to deny that the line between client and server becomes increasingly vague over the years as Next.js or React continues to evolve towards a closer resemblance with other traditional web frameworks, and the byproduct of it - a more sophisticated and volatile (although faster) build system, becomes not easy to match elsewhere.

Don’t get me wrong in thinking that I’m an opponent of Next.js as I may sound a bit critical. The fact is that I am not, its seamless [CICD](https://nextjs.org/docs/deployment#managed-nextjs-with-vercel) integration with Vercel, well crafted developer experience and abundant ecosystem for plug-ins makes it a hard to beat choice for a wide range of customers (from indie hackers to large corps) to build businesses on top of it. I also have tremendous respect for all the talented engineers behind those technologies and their allied mission in pushing the web forward. What I really want to do is taking a step back by zooming out the timeline and looking at things in retrospect, so that I can get a better understanding about what Alex Russel called a “[lost decade](https://twitter.com/slightlylate/status/1582162526275391489?s=61&t=HyxoPteDjXjwAgqCxTfOwg)”. Or make it simple, to reflect if we can justify all the complexities and costs the Next.js and React community gears toward with tangible benefits (e.g. more coherent DX and UX to build better software), just like we can easily justify the long-term benefits that Typescript or ES Modules brings to the web development space bearing all the downsides (complexities, fragmentations etc during the transitional period) they had to introduce, because it used to be a mess w/o them.

Is it becoming better or worse? Is it spiraling upward or downward? Maybe only time can tell.
