---
id: "e5bc7ab4-7997-4481-b902-ec1eb170e3bd"
title: "asdf: another package manager"
slug: "asdf-another-package-manager"
date: "2023-02-03"
updated: 1778859900000
description: "the ultimate version manager for programming languages"
tags: ["Technology"]
---
How would you manage multiple version of Node.js on a single machine?
You may come across [n](https://github.com/tj/n) or [nvm](https://github.com/nvm-sh/nvm).

Not long after, the latest stable version of Node.js is released, along with all the promised improvements, you’ll have projects to upgrade
In `n`,
```shell
n lts
n
```
In `nvm`,
```shell
nvm install --lts
nvm use --lts
```
Equally simple.

However, every once in a while, you’ll need to switch another project written in Ruby, potentially the backend of your Node.js project, then you’ll need to ask the very same question in the beginning of article for Ruby. 
This time you may come across with [rbenv](https://github.com/rbenv/rbenv) and [rvm](https://github.com/rvm/rvm).
How about using the latest stable version of Ruby then?

In `rbenv`,
```shell
rbenv install 3.0.2
rbenv use 3.0.2
```
In `rvm`,
```shell
rvm install --lts
rvm use --lts
```
Here we start to see some issue. Not a surprise, the CLI (command line interface) for the Node and Ruby version managers are different, and discrepancies are hard to remember due to **context switching**.

Fallback to Google? 
Well, don’t repeat yourself.
But the CLI of `nvm` and `rvm` looks similar to each other? 
Yes, until you need to work with a data science tool written in Python and look for something like [`pvm`](https://www.reddit.com/r/Python/comments/s54fr6/python_really_needs_something_like_nvm_but_for/?utm_source=share&utm_medium=ios_app&utm_name=iossmf) while everyone else uses `pyenv`.

It’s clear that what we really want is a **single** CLI tool that manages different versions of different runtime (programming language) with a unified interface, and [asdf](https://asdf-vm.com/) exists exact for this reason.
```shell
asdf install `name` `version`
asdf local `name` `version`
```

Give it a try! :D
