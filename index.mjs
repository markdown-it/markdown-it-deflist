// Process definition lists
//
export default function deflist_plugin (md) {
  const isSpace = md.utils.isSpace

  // Search `[:~][\n ]`, returns next pos after marker on success
  // or -1 on fail.
  function skipMarker (state, line) {
    let start = state.bMarks[line] + state.tShift[line]
    const max = state.eMarks[line]

    if (start >= max) { return -1 }
    if (state.sCount[line] - state.blkIndent >= 4) { return -1 }

    // Check bullet
    const marker = state.src.charCodeAt(start++)
    if (marker !== 0x7E/* ~ */ && marker !== 0x3A/* : */) { return -1 }

    const pos = state.skipSpaces(start)

    // require space after marker if there is inline content
    if (start < max && start === pos) { return -1 }

    return start
  }

  function markTightParagraph (state, start, end, level) {
    let block = -1

    for (let i = start; i < end; i++) {
      const token = state.tokens[i]
      if (token.level !== level || !token.block || token.nesting < 0) { continue }
      if (block >= 0) { return }
      block = i
    }

    if (block < 0 || state.tokens[block].type !== 'paragraph_open') { return }
    state.tokens[block + 2].hidden = true
    state.tokens[block].hidden = true
  }

  function deflist (state, startLine, endLine, silent) {
    if (silent) {
      // quirk: validation mode validates a dd block only, not a whole deflist
      if (state.ddIndent < 0) { return false }
      const markerPos = skipMarker(state, startLine)
      return markerPos >= 0 && state.sCount[startLine] < state.blkIndent
    }

    let nextLine = startLine + 1
    if (nextLine >= endLine) { return false }

    let termIsTight = true

    if (state.isEmpty(nextLine)) {
      nextLine++
      termIsTight = false
      if (nextLine >= endLine) { return false }
    }

    if (state.sCount[nextLine] < state.blkIndent) { return false }
    let contentStart = skipMarker(state, nextLine)
    if (contentStart < 0) { return false }

    const token_dl_o = state.push('dl_open', 'dl', 1)
    const listLines = [startLine, 0]
    token_dl_o.map = listLines

    //
    // Iterate list items
    //

    let dtLine = startLine
    let ddLine = nextLine

    // One definition list can contain multiple DTs,
    // and one DT can be followed by multiple DDs.
    //
    // Thus, there is two loops here, and label is
    // needed to break out of the second one
    //
    /* eslint no-labels:0,block-scoped-var:0 */
    OUTER:
    for (;;) {
      const token_dt_o = state.push('dt_open', 'dt', 1)
      token_dt_o.map = [dtLine, dtLine]

      const token_i = state.push('inline', '', 0)
      token_i.map = [dtLine, dtLine]
      token_i.content = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim()
      token_i.children = []

      state.push('dt_close', 'dt', -1)

      for (;;) {
        const itemTokIdx = state.tokens.length
        const token_dd_o = state.push('dd_open', 'dd', 1)
        const itemLines = [nextLine, 0]
        token_dd_o.map = itemLines

        let pos = contentStart
        const max = state.eMarks[ddLine]
        let offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine])

        while (pos < max) {
          const ch = state.src.charCodeAt(pos)

          if (isSpace(ch)) {
            if (ch === 0x09) {
              offset += 4 - offset % 4
            } else {
              offset++
            }
          } else {
            break
          }

          pos++
        }

        contentStart = pos

        const oldTight = state.tight
        const oldDDIndent = state.ddIndent
        const oldIndent = state.blkIndent
        const oldTShift = state.tShift[ddLine]
        const oldSCount = state.sCount[ddLine]
        const oldParentType = state.parentType
        state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2
        state.tShift[ddLine] = contentStart - state.bMarks[ddLine]
        state.sCount[ddLine] = offset
        state.tight = true
        state.parentType = 'deflist'

        state.md.block.tokenize(state, ddLine, endLine, true)

        if (termIsTight) {
          markTightParagraph(state, itemTokIdx, state.tokens.length, token_dd_o.level + 1)
        }

        state.tShift[ddLine] = oldTShift
        state.sCount[ddLine] = oldSCount
        state.tight = oldTight
        state.parentType = oldParentType
        state.blkIndent = oldIndent
        state.ddIndent = oldDDIndent

        state.push('dd_close', 'dd', -1)

        itemLines[1] = nextLine = state.line

        if (nextLine >= endLine) { break OUTER }

        if (state.sCount[nextLine] < state.blkIndent) { break OUTER }
        contentStart = skipMarker(state, nextLine)
        if (contentStart < 0) { break }

        ddLine = nextLine

        // go to the next loop iteration:
        // insert DD tag and repeat checking
      }

      if (nextLine >= endLine) { break }
      dtLine = nextLine

      if (state.isEmpty(dtLine)) { break }
      if (state.sCount[dtLine] < state.blkIndent) { break }

      ddLine = dtLine + 1
      if (ddLine >= endLine) { break }
      const skippedEmptyLine = state.isEmpty(ddLine)
      if (skippedEmptyLine) { ddLine++ }
      if (ddLine >= endLine) { break }

      if (state.sCount[ddLine] < state.blkIndent) { break }
      contentStart = skipMarker(state, ddLine)
      if (contentStart < 0) { break }
      termIsTight = !skippedEmptyLine

      // go to the next loop iteration:
      // insert DT and DD tags and repeat checking
    }

    // Finilize list
    state.push('dl_close', 'dl', -1)

    listLines[1] = nextLine

    state.line = nextLine

    return true
  }

  md.block.ruler.before('paragraph', 'deflist', deflist, { alt: ['paragraph', 'reference', 'blockquote'] })
};
