---
id: "3dd8639b-9019-4e03-b544-5c479363bb0e"
title: "Migrating software"
slug: "migrating-software"
date: "2022-08-23"
updated: 1778859900000
description: "Modernize legacy system one piece at a time"
tags: ["Technology"]
---
> 80% of the lifetime cost of a piece of software goes to maintenance

[Software migration](https://en.wikipedia.org/wiki/Software_modernization) is quite common among enterprise software, though it's probably not the most exciting puzzle to solve in the engineering fields. I have worked with some legacy systems and felt the pain of dealing with them, so I'd share some thoughts or strategies I've used before. Though there are some concerns worth more considerations than others, namely code synchronization ([DRY principle](/3fb33813555f4f61921d1677bed83640?pvs=25)) and backward compatibility ([contract design](https://en.wikipedia.org/wiki/Design_by_contract)) etc.
## Non-incremental
### Rewrite
That's migrating by rewriting the entire application. Due to restarting from scratch, it has less baggage in longer term but takes longer time span as well, but sometimes it's inevitable to do a full rewrite for tech stack overhauling or avoiding maintenance nightmares.

Pros & Cons
  - It trades [agility](https://agilemanifesto.org/) for simplicity (brute force)
  - It creates a lot of [duplications](/3fb33813555f4f61921d1677bed83640?pvs=25)
  - It has high cost of communication to synchronize changes ([versioning](https://en.wikipedia.org/wiki/Change_management_(engineering))) due to the duplications
## Incremental
### Shared Module
That's migrating by extracting common logic into a shared module. It aims to contain changes (during migration) in a shared module, so that migrations along with feature development or bug fixes won't interfere with each other and thus can be carried out more incrementally.

![](/assets/migrating-software/01-1af1f5dc016323e6-untitled.png)

    Pros & Cons
      - It trades simplicity (upfront design) for [agility](https://agilemanifesto.org/)
      - It minimizes duplication to reduce cost of communication

I break them down into following phases.

**Beginning phase**

![](/assets/migrating-software/02-a3f92278ed671eaa-untitled.png)

    - Modules are migrated from Legacy App to Shared Module in a [“bottom-up”](https://en.wikipedia.org/wiki/Top-down_and_bottom-up_design) manner
    - New App just gets **bootstrapped**
    - Short duration

**Transitional phase**

![](/assets/migrating-software/03-00b0c40e7a139d55-untitled.png)

    - Modules are migrated from Legacy App to Shared Module and from Shared Module to New App
    - New App runs **side by side** with Legacy App
    - Long duration

**Ending phase**

![](/assets/migrating-software/04-3a8d4e1d4e409f5d-untitled.png)

    - Modules are migrated from Shared Module to New App in a [“top-down”](https://en.wikipedia.org/wiki/Top-down_and_bottom-up_design) manner
    - Legacy App gets **deleted**
    - Short duration

Other resources
> Embedded: bookmark
