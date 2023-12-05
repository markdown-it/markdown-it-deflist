import { fileURLToPath } from 'node:url'
import markdownit from 'markdown-it'
import generate from 'markdown-it-testgen'

import deflist from '../index.mjs'

/* eslint-env mocha */

describe('markdown-it-deflist', function () {
  const md = markdownit().use(deflist)

  generate(fileURLToPath(new URL('fixtures/deflist.txt', import.meta.url)), md)
})
