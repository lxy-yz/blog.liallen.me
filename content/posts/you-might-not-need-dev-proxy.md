---
id: "41ec05ae-41ce-447e-9c52-e1bd58aa769a"
title: "You might not need dev proxy"
slug: "you-might-not-need-dev-proxy"
date: "2022-01-09"
updated: 1705029180000
description: ""
tags: ["Technology"]
---
Ever used node.js proxy server(e.g. `webpack-dev-server` w/ the `proxy` option) for local development? It's neat and it does the job well, though not always simple and intuitive.

### Use Case
It’s typically used as an api proxy(reverse), so that your app don’t need to worry about dealing with CORS when API is served at a different domain than the static assets. (example 👇)
```javascript
devServer: {
    port: 3000,
    contentBase: 'public/',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        pathRewrite: {
          '^/api' : ''
        }
      }
    }
  },
}
```

### Issue
The [disparity](https://12factor.net/dev-prod-parity) between dev and prod creates confusions and subtle bugs.

### Solution
Simply remove the dev proxy and use prod url. Then the question becomes “how could prod url serving local bundle”. Short answer: [https://en.wikipedia.org/wiki/Userscript](https://en.wikipedia.org/wiki/Userscript).

A glimpse of how the script may look like
```javascript
document.body.innerHTML = `
  `<div id="app" />`
  `<script src="http://localhost:3000/dist/bundle.js"></script>`
`;
replace(document.body);

function replace(node) {
  if (node.tagName === "SCRIPT") {
    node.parentNode.replaceChild(clone(node), node);
  } else {
    let i = -1,
      children = node.childNodes;
    while (++i < children.length) {
      replace(children[i]);
    }
  }
  return node;
}

function clone(node) {
  let script = document.createElement("script");
  script.text = node.innerHTML;
  let i = -1,
    attrs = node.attributes,
    attr;
  while (++i < attrs.length) {
    script.setAttribute((attr = attrs[i]).name, attr.value);
  }
  return script;
}
```

Now we can simply toggling local vs prod bundle via single button click.
