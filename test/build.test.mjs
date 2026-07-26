import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const fn = require('../')

describe('CJS', () => {
  it('require', () => {
    assert.ok(typeof fn === 'function')
  })
})
