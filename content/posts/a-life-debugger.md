---
id: "135d55c1-b58b-4ce7-985e-97c626655987"
title: "A life debugger"
slug: "a-life-debugger"
date: "2022-06-08"
updated: 1782571320000
description: "A manual for fixing life issues"
tags: []
---
> *It is a painful thing
To look at your own trouble and know
That you yourself and no one else has made it
- Sophocles, Ajax*
![](/assets/a-life-debugger/01-f274fc437520cae4-untitled.gif)
Debugging, despite being one of the most valuable engineering skills to have for programmers, is a hard science to master.
What’s the matter with life though?
## Confrontation
We’ve all experienced life struggles — periods of intense suffering. In those moments, we desperately want to know the cause.
The good news is that the process of troubleshooting life struggles is similar to how programs are debugged.
First thing we need, without surprise, is the **courage** to confront.
## Reproduce
Many bug reports mandate reproducible examples. Anthony Fu [discussed](https://antfu.me/posts/why-reproductions-are-required) about this.
Similarly, we need to make sure our pain is **recurring** in case of being *fooled by *[*randomness*](/e5e8125fd1e143fb9df0c2e0e237dbaf?pvs=25).
In programming, [logging](https://en.wikipedia.org/wiki/Logging_(software)) is our best bet.  However, in real life, we count more on [unreliable memories](https://www.psychologytoday.com/us/blog/hidden-motives/201203/unreliable-memory) rather than a better tool — **journaling **(e.g., “I kept feeling anxious before standups…” → logged it → discovered sleep/caffeine/avoidance pattern)
## Root Cause Analysis
Making the right assumption when things didn’t work as expected is critical though not easy.
Pains (on the surface) and its **root cause** are not the same. It’s tempting to look for pain killers (quick solution) for immediate benefit at the risk of long term **false positives**.
Instead, it’s more effective to understand the **cause effect** (series of previous events or choices that caused current situation) through deep diving and a lot of **patience**.
[Five whys](https://en.wikipedia.org/wiki/Five_whys) is a good technique for root causing real world issues. Again, patience is the key, don’t panic.
![Those “Caused by” lines worth more attention. The lowest “Caused by” line, which takes a lot of **patience** to uncover, may often be the root cause.](/assets/a-life-debugger/02-7e66ad91c2944900-untitled.png)
Another enemy is our ego. Comparing to pointing fingers, [assuming it’s my fault](https://sive.rs/my-fault) (**accountability**) is much harder because self-defending is part of human nature.
The fact that application code is more susceptible than framework or language constructs, [Jeff Atwood](https://en.wikipedia.org/wiki/Jeff_Atwood) even calls it  [first rule of programming](https://blog.codinghorror.com/the-first-rule-of-programming-its-always-your-fault/). It’s our ego that keeps us blind from this simple fact.
## Validation
Don’t forget to validate our assumptions by modifying code (**taking actions)** and re-run the tests (reviewing results).
This eventually builds up a **feedback loop**  from which we obtain better insight and judgments about the original problem through each **iteration**.
**Persistence** is the key, knowledge **compounds** if heading towards the right direction.
## Post-mortem
Eventually the bug will be fixed. Time to party?
Hold on for a second.
Do our future self a favor with a post-mortem **reflection **that summarizes the lesson learnt and checks where else the same lesson can be applied.
