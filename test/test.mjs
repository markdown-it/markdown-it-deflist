import { fileURLToPath } from 'node:url'
import { describe } from 'node:test'
import markdownit from 'markdown-it'
import { generateTests } from './helpers.mjs'

import deflist from '../index.mjs'

describe('markdown-it-deflist', function () {
  const md = markdownit().use(deflist)

  generateTests(fileURLToPath(new URL('fixtures/deflist.txt', import.meta.url)), md)
})
