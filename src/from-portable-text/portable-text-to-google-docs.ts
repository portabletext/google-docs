import type {Schema} from '@portabletext/schema'
import {
  isPortableTextBlock,
  isPortableTextSpan,
  toPlainText,
  uriLooksSafe,
} from '@portabletext/toolkit'
import type {
  ArbitraryTypedObject,
  PortableTextBlock,
  PortableTextMarkDefinition,
  TypedObject,
} from '@portabletext/types'
import {defaultSchema} from '../default-schema'
import {serializeDegradationMessage} from './degradation-messages'
import {
  buildSerializeDegradationMessage,
  truncateSnippet,
  type SerializeDegradation,
  type SerializeDegradationWithTopIndex,
} from './degradation-report'
import {decoratorTextStyles, writtenTextStyleFields} from './renderers/marks'
import {namedStyleTypes} from './renderers/style'
import type {GoogleDocsRequest, NamedStyleType, TextStyle} from './requests'

/**
 * A new document's body starts with a section break at index 0, so its
 * first paragraph starts at index 1. Every block is inserted there.
 */
const BODY_START = 1

/**
 * @public
 */
export type PortableTextToGoogleDocsOptions = {
  /**
   * Compiled schema deciding which styles, decorators and annotations are
   * written. A construct the schema doesn't declare is written as plain
   * text and reported, even when the conversion has a Google Docs form for
   * it. Omitted, the default schema applies: `normal` and `h1` to `h6`,
   * the `strong`, `em`, `code`, `underline` and `strike-through`
   * decorators and the `link` annotation.
   */
  schema?: Schema

  /**
   * Called at most once, after the conversion has walked every block,
   * only when at least one construct degraded to a lossier rendering.
   * Left unset, the conversion stays silent and returns the lossiest
   * representation it can build. Passed a function, observe every
   * degradation via `report.degradations`, in encounter order, and the
   * same degradations grouped and sorted by block via `report.message`.
   * Enforce against lossy output by throwing your own error from inside
   * the callback. The throw propagates out of `portableTextToGoogleDocs`.
   *
   * ```ts
   * portableTextToGoogleDocs(blocks, {onDegradation: ({message}) => { throw new Error(message) }})
   * ```
   *
   * `report` is a single object, not positional parameters, so it can
   * gain fields later without a breaking change.
   */
  onDegradation?: (report: {
    degradations: Array<SerializeDegradation>
    message: string
  }) => void
}

type PathSegment = SerializeDegradation['path'][number]

/**
 * Records a degradation in encounter order and returns the recorded entry,
 * so a mark reported when it opens can have its snippet filled in when it
 * closes.
 */
type Report = (
  degradation: Pick<SerializeDegradation, 'type' | 'message' | 'path'> & {
    snippet: string | undefined
  },
) => SerializeDegradation

type StyledRange = {
  start: number
  end: number
  textStyle: TextStyle
  fields: string
}

type Paragraph = {
  text: string
  ranges: Array<StyledRange>
  namedStyleType: NamedStyleType
}

/**
 * Converts Portable Text to the requests of a Google Docs
 * `documents.batchUpdate` call that fills an empty document.
 *
 * @public
 */
export function portableTextToGoogleDocs<
  Block extends TypedObject = PortableTextBlock | ArbitraryTypedObject,
>(
  blocks: Array<Block>,
  options: PortableTextToGoogleDocsOptions = {},
): Array<GoogleDocsRequest> {
  const schema = options.schema ?? defaultSchema
  const degradations: Array<SerializeDegradationWithTopIndex> = []
  const paragraphs: Array<Paragraph> = []

  blocks.forEach((node, index) => {
    const topSegment: PathSegment = node._key ? {_key: node._key} : index
    const report: Report = ({snippet, ...degradation}) => {
      const entry: SerializeDegradationWithTopIndex = {
        ...degradation,
        ...(snippet === undefined ? {} : {snippet}),
        topIndex: index,
      }
      degradations.push(entry)
      return entry
    }

    if (isPortableTextBlock(node)) {
      paragraphs.push(readTextBlock(node, topSegment, schema, report))
      return
    }

    report({
      type: 'object-dropped',
      message: serializeDegradationMessage['object-dropped'](
        node._type,
        'block',
      ),
      path: [topSegment],
      snippet: undefined,
    })
  })

  if (options.onDegradation && degradations.length > 0) {
    options.onDegradation({
      degradations: degradations.map(
        ({topIndex: _topIndex, ...degradation}) => degradation,
      ),
      message: buildSerializeDegradationMessage(degradations),
    })
  }

  // Built back to front, so every block is inserted at the start of the
  // body and nothing placed earlier needs its indexes recalculated. The
  // last block takes over the empty paragraph a new document already
  // holds, so it brings no newline of its own: the document ends without
  // a stray empty paragraph.
  return paragraphs
    .map((paragraph, position) =>
      writeParagraph(paragraph, position < paragraphs.length - 1),
    )
    .reverse()
    .flat()
}

function writeParagraph(
  {text, ranges, namedStyleType}: Paragraph,
  bringsNewline: boolean,
): Array<GoogleDocsRequest> {
  const requests: Array<GoogleDocsRequest> = []
  const insertedText = bringsNewline ? `${text}\n` : text

  if (insertedText.length > 0) {
    requests.push({
      insertText: {location: {index: BODY_START}, text: insertedText},
    })
  }

  // Inserted text can take on the text style of the paragraph placed
  // after it, so every paragraph, the document's own included, starts
  // from the defaults over its text and newline before its own ranges.
  requests.push({
    updateTextStyle: {
      range: {startIndex: BODY_START, endIndex: BODY_START + text.length + 1},
      textStyle: {},
      fields: writtenTextStyleFields,
    },
  })

  for (const range of ranges) {
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: BODY_START + range.start,
          endIndex: BODY_START + range.end,
        },
        textStyle: range.textStyle,
        fields: range.fields,
      },
    })
  }

  // A new paragraph takes the paragraph style of the one it was split
  // from, so every paragraph gets its own, the document's empty paragraph
  // included.
  requests.push({
    updateParagraphStyle: {
      range: {startIndex: BODY_START, endIndex: BODY_START + text.length + 1},
      paragraphStyle: {namedStyleType},
      fields: 'namedStyleType',
    },
  })

  return requests
}

type OpenMark = {
  start: number
  sourceStart: number
  /**
   * The mark's text style, or the degradation reported when the mark
   * opened, so it keeps its encounter order. Its snippet is filled in
   * when the mark closes.
   */
  resolved: {textStyle: TextStyle; fields: string} | SerializeDegradation
}

function readTextBlock(
  block: PortableTextBlock,
  topSegment: PathSegment,
  schema: Schema,
  report: Report,
): Paragraph {
  const snippet = () => truncateSnippet(toPlainText(block))

  if (block.listItem !== undefined) {
    const declared = schema.lists.some((item) => item.name === block.listItem)
    report({
      type: 'list-item-fallback',
      message: serializeDegradationMessage['list-item-fallback'](
        block.listItem,
        declared ? 'no-renderer' : 'undeclared',
      ),
      path: [topSegment],
      snippet: snippet(),
    })
  }

  const style = block.style ?? 'normal'
  const styleDeclared = schema.styles.some((item) => item.name === style)
  const namedStyleType = styleDeclared ? namedStyleTypes.get(style) : undefined
  if (namedStyleType === undefined) {
    report({
      type: 'style-fallback',
      message: serializeDegradationMessage['style-fallback'](
        style,
        styleDeclared ? 'no-renderer' : 'undeclared',
      ),
      path: [topSegment],
      snippet: snippet(),
    })
  }

  const markDefs = new Map<string, PortableTextMarkDefinition>(
    (block.markDefs ?? []).map((markDef) => [markDef._key, markDef]),
  )
  let text = ''
  // The span text as written, for snippets: `text` is what Docs receives.
  let sourceText = ''
  const ranges: Array<StyledRange> = []
  const openMarks = new Map<string, OpenMark>()

  // A mark spanning adjacent spans is one range, written and reported
  // once, from where it opens to where the first span without it starts.
  const openMark = (markKey: string, path: Array<PathSegment>) => {
    const markDef = markDefs.get(markKey)
    const resolved = markDef
      ? resolveAnnotation(markDef, schema)
      : resolveDecorator(markKey, schema)
    openMarks.set(markKey, {
      start: text.length,
      sourceStart: sourceText.length,
      resolved:
        'degradation' in resolved
          ? report({...resolved.degradation, path, snippet: undefined})
          : resolved,
    })
  }

  const closeMark = (markKey: string, open: OpenMark) => {
    openMarks.delete(markKey)
    const {resolved} = open
    if ('path' in resolved) {
      const snippet = truncateSnippet(sourceText.slice(open.sourceStart))
      if (snippet !== undefined) {
        resolved.snippet = snippet
      }
      return
    }
    if (open.start < text.length) {
      ranges.push({start: open.start, end: text.length, ...resolved})
    }
  }

  block.children.forEach((child, childIndex) => {
    const path = [
      topSegment,
      'children',
      child._key ? {_key: child._key} : childIndex,
    ]

    if (!isPortableTextSpan(child)) {
      report({
        type: 'object-dropped',
        message: serializeDegradationMessage['object-dropped'](
          child._type,
          'inline',
        ),
        path,
        snippet: undefined,
      })
      return
    }

    const marks = new Set(child.marks ?? [])
    for (const [markKey, open] of openMarks) {
      if (!marks.has(markKey)) {
        closeMark(markKey, open)
      }
    }
    for (const markKey of marks) {
      if (!openMarks.has(markKey)) {
        openMark(markKey, path)
      }
    }
    text += toDocsText(child.text)
    sourceText += child.text
  })
  for (const [markKey, open] of openMarks) {
    closeMark(markKey, open)
  }

  return {
    text,
    ranges: ranges.sort((a, b) => a.start - b.start || a.end - b.end),
    namedStyleType: namedStyleType ?? 'NORMAL_TEXT',
  }
}

/**
 * Docs strips these from inserted text: the control characters other than
 * tab, line feed and vertical tab, and the Private Use Area of the Basic
 * Multilingual Plane. Left in, every index after them would be off.
 */
const STRIPPED_BY_DOCS = new RegExp(
  '[\\u0000-\\u0008\\u000c-\\u001f\\ue000-\\uf8ff]',
  'g',
)

/**
 * A `\n` would split the paragraph in two, so it is written as the
 * vertical tab Docs uses for a line break inside a paragraph.
 */
function toDocsText(text: string): string {
  return text.replace(/\n/g, '\u000b').replace(STRIPPED_BY_DOCS, '')
}

type ResolvedMark =
  | {textStyle: TextStyle; fields: string}
  | {degradation: Pick<SerializeDegradation, 'type' | 'message'>}

function resolveDecorator(markType: string, schema: Schema): ResolvedMark {
  const declared = schema.decorators.some((item) => item.name === markType)
  const resolved = declared ? decoratorTextStyles.get(markType) : undefined
  if (resolved) {
    return resolved
  }
  return {
    degradation: {
      type: 'decorator-dropped',
      message: serializeDegradationMessage['decorator-dropped'](
        markType,
        declared ? 'no-renderer' : 'undeclared',
      ),
    },
  }
}

function resolveAnnotation(
  markDef: PortableTextMarkDefinition,
  schema: Schema,
): ResolvedMark {
  const markType = markDef._type
  const declared = schema.annotations.some((item) => item.name === markType)
  const dropped = (
    cause: Parameters<
      (typeof serializeDegradationMessage)['annotation-dropped']
    >[1],
  ): ResolvedMark => ({
    degradation: {
      type: 'annotation-dropped',
      message: serializeDegradationMessage['annotation-dropped'](
        markType,
        cause,
      ),
    },
  })

  if (!declared) {
    return dropped('undeclared')
  }
  if (markType !== 'link') {
    return dropped('no-renderer')
  }
  const href: unknown = markDef['href']
  if (typeof href !== 'string' || href.trim() === '') {
    return dropped('missing-url')
  }
  if (!uriLooksSafe(href)) {
    return dropped('unsafe-url')
  }
  return {textStyle: {link: {url: href}}, fields: 'link'}
}
