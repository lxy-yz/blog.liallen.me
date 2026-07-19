---
id: "fa72f690-dc45-4c3a-8469-5d4dbdd5e887"
title: "Reverse engineer a GPT chatbot"
slug: "reverse-engineer-a-gpt-chatbot"
date: "2023-04-07"
updated: 1778859900000
description: "How to build a chatbot with this blog’s data"
tags: ["Technology"]
---

> If you’re interested in a more detailed explanation and walkthrough, I would highly recommend this [article](https://www.lennysnewsletter.com/p/i-built-a-lenny-chatbot-using-gpt) about Lenny’s Chatbot. Very approachable and well written.

Since the public release of GPT-3 API, the Internet is flooding with chatbots built on top of it. The chatbots are trained from all sorts of data, like [essays](http://www.paulgraham.com/articles.html) from Paul Graham, twitter [threads](https://nav.al/rich) from Naval, podcast [episodes](https://podcasts.apple.com/us/podcast/the-tim-ferriss-show/id863897795) from Tim Ferriss. But how can we build a bot for our own? Let’s reverse engineer it.

### Problem
Rephrase what we want to achieve, it creates the problem to solve. I describe the problem as building a chatbot that answers questions based on data from my personal [blog](http://blog.liallen.me). It translates to the prompt below
```plain text
Based on context given below (text within """), answer the following question:
`your question`

"""
`data from my blog`
"""
```
The question is typed in by user, thus we only need to handle the data part of the prompt. The quickest way is to hard code it by copy-pasting entire article into the prompt. It works fine for a single article, but what about tens or hundreds of articles? The answer is that we can automate this process with a website scraper.

Once we got all the data we need, are we all set? There is a thing called [**token limit**](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) that doesn’t allow more than 4097 tokens per chat prompt. This is a technical constraint from OpenAI side which is likely to change consider how fast the technology evolves. But what can we do given we can’t supply all the articles? The answer is simply providing fewer articles (or less data more precisely).

Wouldn’t fewer articles affect the quality of answer? Most likely yes, unless they’re highly relevant to the question. The amount of information alone doesn’t dictate the quality of the prompt. What we need to do is to provide less amount but highly relevant data to the question.

Up until now, we get some smaller problems to solve instead.

### Sub Problems
Here are the sub problems
- How to scrape a blogging website?
  There’re many different ways of doing this. And it can be done in different programming languages. The idea is that you need some kind of script to crawl the content of a webpage and its sub pages by following all internal links. Pick one that you’re comfortable with and save the scraped data into a file for consumption.
- How to provide fewer article (or data) with high relevance?
  Split all the articles into chunks and make them searchable by using index. Similar to how index being used in database, it stores a collection of pieces of text in a way that makes them easily searchable. The technical term is called  e[mbeddings](https://platform.openai.com/docs/guides/embeddings), a condensed mathematical representation of each chunk of text. If you want to know if two pieces of text are similar, you just calculate the embeddings for them and compare. Text chunks with embeddings that are “closer” together are similar.

The subproblems are easier and more concrete that we can easily find answers from Google, or better just ask ChatGPT about it. I’d leave out the implementation details since they’re relatively trivial.

### Demo
Following the thought process above, here’s the chatbot I built for myself that answers questions about myself based on data of this blog.
[Embedded content](https://allen-gpt.vercel.app/)

### Resources
> Embedded: bookmark
> Embedded: external_object_instance
> Embedded: bookmark
> Embedded: external_object_instance
