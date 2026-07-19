---
id: "c90b74b7-efe0-4cba-810c-58f8a6376dd0"
title: "Webpack bundling UMD module"
slug: "webpack-bundling-umd-module"
date: "2022-01-09"
updated: 1705029180000
description: "Better not have to deal with it at all"
tags: ["Technology"]
---
## Background
Webpack is a module bundler that supports  `esm`, `cjs`, `amd` out of box. But if you are migrating from a legacy web app that expect global dependencies and relying on namespace instead of any module system, you might have some problem to solve.
### Problem
One of the common problem you might encounter with is some of the node dependencies installed are distributed in `umd` format. E.g.
```javascript
// Example importer
import 'moment/min/locales';

// pre bundle
(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
    define([], factory(root));
  } else if ( typeof exports === 'object' ) {
    module.exports = factory(root);
  } else {
    root.myPlugin = factory(root);
  }
})(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
    ...
})

// post bundle
(function(module) {
    !function(a, b) {
        true ? module.exports = b() : undefined
    }
    ...
})
```
When loading the bundle into browser, `module.exports = b()` instead of `root.myPlugin = factory(root);`been loaded. The reason is UMD is meant to run directly in browser or node without extra build steps.
### Solution
[https://v4.webpack.js.org/loaders/script-loader/](https://v4.webpack.js.org/loaders/script-loader/) is the most simple and naive way to go. Think it as loading the script via script tags directly. This might be the best solution if you don’t have web security concerns. The biggest downside is that it is uses `eval` behind the scene, and `eval` will be blocked by [https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy).
[https://webpack.js.org/loaders/imports-loader/](https://webpack.js.org/loaders/imports-loader/) grants more granular control over how global dependencies can be imported. Following example tells its power.
```javascript
// webpack.config
use: {
    loader: 'imports-loader',
    options: {
      wrapper: {
        thisArg: 'window',
        args: {
          module: false,
          exports: false,
          define: false,
        },
      },
    },
  },
},

// broken bundle
(function(module) {
    !function(a, b) {
        true ? module.exports = b() : undefined
    }
    ...
})()

// transformed bundle
(function(module, exports, define) {

  // same as above pre bundle, w/o the broken transformation.
  // thanks to the IIFE wrapper due to the webpack config.
  (function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
      define([], factory(root));
    } else if ( typeof exports === 'object' ) {
      module.exports = factory(root);
    } else {
      root.myPlugin = factory(root);
    }
  })(typeof global !== "undefined" ? global : this.window || this.global, function (root) {
    ...
  })

})(false, false, false)
```
### Other resources you might find useful
- [https://webpack.js.org/guides/shimming/](https://webpack.js.org/guides/shimming/) comprehensive guide over what loaders you might need
- [https://webpack.js.org/loaders/expose-loader/](https://webpack.js.org/loaders/expose-loader/): for cjs modules that exposed as global variables
