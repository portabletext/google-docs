/**
 * The classification of a lossy conversion encountered while converting
 * Portable Text to Google Docs requests: a block style, decorator or
 * annotation the schema doesn't declare or the conversion has no Google
 * Docs form for, a link whose `href` is missing or unsafe, a list item
 * written as a paragraph, or a block or inline object written as nothing.
 *
 * @public
 */
export type SerializeDegradationType =
  | 'annotation-dropped'
  | 'decorator-dropped'
  | 'style-fallback'
  | 'list-item-fallback'
  | 'object-dropped'

/**
 * Reports a single lossy conversion, in encounter order: as the walk
 * reads the blocks array, top to bottom. `path` addresses the node the
 * loss occurred on, read from the top-level `blocks` array down: an array
 * position is `{_key: node._key}` when the node at that position has a
 * `_key`, the numeric index otherwise, and an object property is its
 * field name. A mark covering several adjacent spans reports once, with
 * the first covered span's path. `snippet` is the offending text,
 * truncated to 40 characters with an ellipsis, present whenever there's a
 * specific piece of text to quote and absent when there is none (an empty
 * span, an object). `message` is human-readable and may change between
 * releases. Match on `type`, not `message`. The set of `type` values grows
 * in minor releases as new degradation sites report, so compare against
 * the values you handle rather than switching exhaustively.
 *
 * @public
 */
export type SerializeDegradation = {
  type: SerializeDegradationType
  message: string
  path: Array<string | number | {_key: string}>
  snippet?: string
}

/**
 * Truncates a degradation message's snippet to keep the reported message
 * readable, backing off by one unit when the cut would land on a lead
 * surrogate so a snippet ending mid-emoji doesn't produce an unpaired
 * surrogate. Undefined for empty input, so a construct with nothing to
 * quote omits `snippet` entirely instead of reporting `""`.
 */
export function truncateSnippet(
  text: string,
  maxLength = 40,
): string | undefined {
  if (text.length === 0) {
    return undefined
  }

  if (text.length <= maxLength) {
    return text.replace(/\n/g, '\\n')
  }

  let cut = maxLength
  const codeUnit = text.charCodeAt(cut - 1)
  if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
    cut -= 1
  }

  return `${text.slice(0, cut).replace(/\n/g, '\\n')}...`
}

const MAX_LISTED_PER_GROUP = 5

function capList(values: ReadonlyArray<string>): string {
  if (values.length <= MAX_LISTED_PER_GROUP) {
    return values.join(', ')
  }
  const shown = values.slice(0, MAX_LISTED_PER_GROUP)
  const more = values.length - MAX_LISTED_PER_GROUP
  return `${shown.join(', ')}, and ${more} more`
}

/**
 * A `SerializeDegradation` paired with the 0-based index of its enclosing
 * top-level block, used only to render and sort the grouped message:
 * `path`'s first segment can be a `_key`, which doesn't sort by document
 * order. Not part of the public payload.
 */
export type SerializeDegradationWithTopIndex = SerializeDegradation & {
  topIndex: number
}

/**
 * Builds the canonical grouped message reported alongside a non-empty
 * `degradations` array: identical (`type`, `message`) pairs collapse into
 * one line, so a document with the same missing decorator on three spans
 * doesn't repeat the same sentence three times. Groups sort by their
 * earliest `topIndex`, so the message reads top to bottom.
 *
 * Mirrors `@portabletext/markdown`'s `buildSerializeDegradationMessage`.
 */
export function buildSerializeDegradationMessage(
  degradations: ReadonlyArray<SerializeDegradationWithTopIndex>,
): string {
  const groups: Array<{
    base: string
    entries: Array<SerializeDegradationWithTopIndex>
  }> = []
  const groupIndexByKey = new Map<string, number>()

  for (const degradation of degradations) {
    const key = `${degradation.type}\u0000${degradation.message}`
    let groupIndex = groupIndexByKey.get(key)
    if (groupIndex === undefined) {
      groupIndex = groups.length
      groupIndexByKey.set(key, groupIndex)
      groups.push({base: degradation.message, entries: []})
    }
    groups[groupIndex]!.entries.push(degradation)
  }

  const minTopIndex = (
    entries: ReadonlyArray<SerializeDegradationWithTopIndex>,
  ): number =>
    entries.reduce(
      (lowest, entry) => Math.min(lowest, entry.topIndex),
      Number.POSITIVE_INFINITY,
    )

  const sortedGroups = [...groups].sort(
    (a, b) => minTopIndex(a.entries) - minTopIndex(b.entries),
  )

  const lines = sortedGroups.map((group) => {
    if (group.entries.length === 1) {
      const event = group.entries[0]!
      const snippetPart =
        event.snippet === undefined ? '' : ` ("${event.snippet}")`
      return `- block ${event.topIndex}: ${event.message}${snippetPart}`
    }

    const snippets = group.entries
      .map((entry) => entry.snippet)
      .filter((snippet): snippet is string => snippet !== undefined)

    const count = group.entries.length
    const suffix =
      snippets.length === count
        ? `(${count}×: ${capList(snippets.map((snippet) => `"${snippet}"`))})`
        : `(${count}×: blocks ${capList([...new Set(group.entries.map((entry) => entry.topIndex))].sort((a, b) => a - b).map(String))})`

    return `- ${group.base} ${suffix}`
  })

  return [
    'Portable Text could not be converted to Google Docs without loss:',
    ...lines,
  ].join('\n')
}
