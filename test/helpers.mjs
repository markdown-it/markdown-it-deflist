import { readFileSync } from 'node:fs'
import { relative } from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

function fixLF (str) {
  return str.length ? str + '\n' : str
}

function parseFixtureFile (input, sep = '.') {
  const lines = input.split(/\r?\n/g)
  const fixtures = []
  let line = 0

  while (line < lines.length) {
    if (lines[line] !== sep) {
      line++
      continue
    }

    const fixture = {
      header: '',
      first: { text: '', line: 0 },
      second: { text: '' }
    }

    line++
    const firstStart = line

    while (line < lines.length && lines[line] !== sep) line++
    if (line >= lines.length) break

    fixture.first.text = fixLF(lines.slice(firstStart, line).join('\n'))
    fixture.first.line = firstStart - 1

    line++
    const secondStart = line

    while (line < lines.length && lines[line] !== sep) line++
    if (line >= lines.length) break

    fixture.second.text = fixLF(lines.slice(secondStart, line).join('\n'))
    line++

    for (let i = firstStart - 2; i >= Math.max(0, firstStart - 3); i--) {
      if (lines[i] === sep) break
      if (lines[i].trim()) {
        fixture.header = lines[i].trim()
        break
      }
    }

    fixtures.push(fixture)
  }

  return fixtures
}

export function generateTests (file, md) {
  describe(relative(process.cwd(), file), function () {
    parseFixtureFile(readFileSync(file, 'utf8')).forEach(fixture => {
      const name = fixture.header
        ? `line ${fixture.first.line}: ${fixture.header}`
        : `line ${fixture.first.line}`

      it(name, function () {
        assert.strictEqual(
          md.render(fixture.first.text),
          fixture.second.text,
          `${relative(process.cwd(), file)} ${name}`
        )
      })
    })
  })
}
