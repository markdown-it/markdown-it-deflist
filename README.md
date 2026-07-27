# markdown-it-deflist

[![CI](https://github.com/markdown-it/markdown-it-deflist/actions/workflows/ci.yml/badge.svg)](https://github.com/markdown-it/markdown-it-deflist/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/markdown-it-deflist.svg?style=flat)](https://www.npmjs.org/package/markdown-it-deflist)
[![Coverage Status](https://img.shields.io/coveralls/markdown-it/markdown-it-deflist/master.svg?style=flat)](https://coveralls.io/r/markdown-it/markdown-it-deflist?branch=master)

> Definition list (`<dl>`) tag plugin for [markdown-it](https://github.com/markdown-it/markdown-it) markdown parser.

Syntax is largely compatible with [Pandoc definition lists](https://pandoc.org/MANUAL.html#definition-lists)
in the `commonmark_x` Markdown variant.


## Install

```bash
npm install markdown-it-deflist --save
```

## Use

```js
var md = require('markdown-it')()
            .use(require('markdown-it-deflist'));

md.render(/*...*/);
```

## Known differences

Pandoc removes paragraph wrappers from compact definitions even when a
definition contains multiple block elements. This plugin preserves the `<p>`
tags in that case, so block boundaries are not lost.

Block parsing follows markdown-it, so edge cases involving lazy continuation
and nested block containers may differ from Pandoc.

```md
Term
: First paragraph.

  - list item
```

Pandoc renders:

```html
<dl>
<dt>Term</dt>
<dd>
First paragraph.
<ul>
<li>list item</li>
</ul>
</dd>
</dl>
```

This plugin renders:

```html
<dl>
<dt>Term</dt>
<dd>
<p>First paragraph.</p>
<ul>
<li>list item</li>
</ul>
</dd>
</dl>
```

Pandoc's `commonmark_x` reader accepts multiple blank lines between a term and
its first definition marker:

```md
Term


: definition
```

This plugin accepts at most one blank line, so the example above is rendered as
two paragraphs instead of a definition list.

Pandoc's `commonmark_x` reader also accepts terms spanning multiple lines:

```md
First line
second line
: definition
```

This plugin requires each term to fit on one line, so this example is not
parsed as a definition list.

_Differences in browser._ If you load script directly into the page, without
package system, module will add itself globally as `window.markdownitDeflist`.
