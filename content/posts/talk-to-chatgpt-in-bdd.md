---
id: "29d482cf-93a8-46fb-abed-f4b491317d0f"
title: "Talk to ChatGPT in  BDD"
slug: "talk-to-chatgpt-in-bdd"
date: "2023-02-20"
updated: 1705029180000
description: ""
tags: ["Technology"]
---
## Background
Given we all know that ChatGPT is
- Context-aware
- Capable of generating code snippets
And [BDD](https://martinfowler.com/bliki/GivenWhenThen.html) isn’t anything unfamiliar to most programmers,
Then why not combine the both world?
## Experiment
### ChatGPT Prompt
```plain text
Given I’ve a notion database with properties
- name (text)
- type (select with article, book, tweet, as options)
- created (date)
- read? (checkbox)

When receiving prompt “Outliers(Malcolm Gladwell) today” as input,

Then insert it into notion database using notion API
```
> Embedded: alias
### ChatGPT Response
> To insert the given input into a Notion database using the Notion API, you can use the following code in Node.js:
  ```javascript
const { Client } = require("@notionhq/client");

// Initializing a client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ID of the database
const databaseId = "`your database ID`";

// Properties of the new record
const name = { title: [{ text: { content: "Outliers (Malcolm Gladwell)" } }] };
const type = { select: { name: "book" } };
const created = { date: { start: new Date() } };
const read = { checkbox: false };

// Creating the new record
const newRecord = {
  name,
  type,
  created,
  read,
};

// Adding the new record to the database
async function addRecordToDatabase() {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: newRecord,
    });

    console.log("New record has been added: ", response);
  } catch (error) {
    console.error(error.body);
  }
}

addRecordToDatabase();
  ```
  Make sure to replace **`<your database ID>`** with the actual ID of your Notion database, which can be found in the URL when you're viewing the database.
  You can modify the property values as needed to match your specific database schema.
Note: the interesting part is how ChatGPT automatically inferred the value of notion database properties `type`, `created` and `read?`, it’s not always **accurate, **check it twice!
### Diagram
By greying out the ChatGPT part, It’s as if Notion can understand natural languages that ChatGPT is capable of interpreting.
![](/assets/talk-to-chatgpt-in-bdd/01-89d64dbdc271c9f4-untitled.png)
## What’s next
It should be obvious that the ability of GPT-3 (underlying AI model) to take unstructured input and convert it to functional output isn’t limit to Notion API. It’s an indicator that the tedious low-level task of figuring out how to glue services with different API specs can be delegated to AI, which further unleashes programmers productivity and creativity.

As mentioned above, the “parameterized output” generated isn’t always accurate, while you can manually verifying results for simple cases like above, **reliability** will likely be a concern for more advanced workflows that glued by automation tools like Zappier, AWS Step Functions etc. Nevertheless, it’s still rather exciting to see what similar ideas can lead to.
## Inspiration
> Embedded: tweet

---
Note:
If replacing the above notion API with cURL, we’ll get following response
> To use cURL to insert a new record into a Notion database, you can use the Notion API's **`/v1/pages`**
 endpoint. Here's an example cURL command that will create a new page in your Notion database:
  ```bash
curl --location --request POST 'https://api.notion.com/v1/pages' \
--header 'Notion-Version: 2021-05-13' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_API_SECRET_KEY' \
--data-raw '{
    "parent": {
        "database_id": "YOUR_DATABASE_ID"
    },
    "properties": {
        "name": {
            "title": [
                {
                    "text": {
                        "content": "Outliers(Malcolm Gladwell)"
                    }
                }
            ]
        },
        "type": {
            "select": {
                "name": "book"
            }
        },
        "created": {
            "date": {
                "start": "2022-12-25"
            }
        },
        "read?": {
            "checkbox": true
        }
    }
}'
  ```

Make sure to replace **`YOUR_API_SECRET_KEY`**
 with your actual Notion API secret key, **`YOUR_DATABASE_ID`**
 with the actual database ID of the Notion database you want to insert the record into, and adjust the property values as needed for your specific database.
