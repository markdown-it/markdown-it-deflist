import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import markdownit from 'markdown-it'
import deflist from '../index.mjs'

describe('definition term source maps', function () {
  const md = markdownit().use(deflist)

  for (const [name, source, expected] of [
    ['a single term', 'Term\n: definition\n', [[0, 1]]],
    ['multiple terms', 'First\n: one\n\nSecond\n: two\n', [[0, 1], [3, 4]]],
    ['a term inside a blockquote', '> Term\n> : definition\n', [[0, 1]]],
    ['a term after another block', 'Paragraph\n\nTerm\n: definition\n', [[2, 3]]]
  ]) {
    it(`maps ${name} to its complete source line`, function () {
      const tokens = md.parse(source, {})
      const terms = tokens.filter(token => token.type === 'dt_open')
      assert.deepStrictEqual(terms.map(token => token.map), expected)
      assert.deepStrictEqual(terms.map(token => tokens[tokens.indexOf(token) + 1].map), expected)
    })
  }

  it('uses the same exclusive end as a one-line paragraph', function () {
    const paragraph = md.parse('Term\n', {})[0]
    const term = md.parse('Term\n: definition\n', {}).find(token => token.type === 'dt_open')
    assert.deepStrictEqual(term.map, paragraph.map)
  })
})
