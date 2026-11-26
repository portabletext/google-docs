# `@portabletext/google-docs`

> Convert Portable Text to Google Docs

## Installation

```bash
npm install @portabletext/google-docs
```

## Quick start

**Portable Text → Google Docs**

```ts
import {portableTextToGoogleDocs} from '@portabletext/google-docs'

const requests = portableTextToGoogleDocs([
  {
    _type: 'block',
    _key: 'f4s8k2',
    style: 'h1',
    children: [
      {_type: 'span', _key: 'a9c3x1', text: 'Hello ', marks: []},
      {_type: 'span', _key: 'b7d2m5', text: 'world', marks: ['strong']},
    ],
    markDefs: [],
  },
])
```

```json
[
  {"insertText": {"location": {"index": 1}, "text": "Hello world"}},
  {
    "updateTextStyle": {
      "range": {"startIndex": 1, "endIndex": 13},
      "textStyle": {},
      "fields": "bold,italic,underline,strikethrough,weightedFontFamily,link"
    }
  },
  {
    "updateTextStyle": {
      "range": {"startIndex": 7, "endIndex": 12},
      "textStyle": {"bold": true},
      "fields": "bold"
    }
  },
  {
    "updateParagraphStyle": {
      "range": {"startIndex": 1, "endIndex": 13},
      "paragraphStyle": {"namedStyleType": "HEADING_1"},
      "fields": "namedStyleType"
    }
  }
]
```

The package only converts. It never signs in, never calls Google and doesn't depend on `googleapis`. Your app sends the requests to an empty document, for example one it just created with [`documents.create`](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/create):

```ts nocheck
await fetch(
  `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({requests}),
  },
)
```

## Supported features

| Feature                | Portable Text → Google Docs          |
| ---------------------- | ------------------------------------ |
| Paragraphs             | ✅ Normal text                       |
| Headings (h1–h6)       | ✅ Heading 1 to Heading 6            |
| Bold                   | ✅                                   |
| Italic                 | ✅                                   |
| Underline              | ✅                                   |
| Strikethrough          | ✅                                   |
| Inline code            | ✅ The `Roboto Mono` font            |
| Links                  | ✅                                   |
| Line breaks in a block | ✅ A line break inside the paragraph |
| Lists                  | ❌ Written as paragraphs, reported   |
| Block objects          | ❌ Written as nothing, reported      |
| Inline objects         | ❌ Written as nothing, reported      |

Google Docs has no inline code, only fonts, so `code` is written as `Roboto Mono`.

To convert HTML copied from Google Docs, use [`@portabletext/html`](https://github.com/portabletext/html) instead. This package works with the Google Docs API.

## Usage

### `portableTextToGoogleDocs`

```ts
import {portableTextToGoogleDocs} from '@portabletext/google-docs'

const requests = portableTextToGoogleDocs([
  {
    _type: 'block',
    _key: 'k9f2x1',
    style: 'h2',
    children: [{_type: 'span', _key: 's1a2b3', text: 'Notes', marks: []}],
    markDefs: [],
  },
  {
    _type: 'block',
    _key: 'm3n4p5',
    style: 'normal',
    children: [
      {_type: 'span', _key: 's2c3d4', text: 'Run ', marks: []},
      {_type: 'span', _key: 's3e4f5', text: 'pnpm test', marks: ['code']},
      {_type: 'span', _key: 's4g5h6', text: ', see ', marks: []},
      {_type: 'span', _key: 's5i6j7', text: 'the docs', marks: ['a1b2c3']},
    ],
    markDefs: [{_type: 'link', _key: 'a1b2c3', href: 'https://example.com'}],
  },
])
```

```json
[
  {
    "insertText": {
      "location": {"index": 1},
      "text": "Run pnpm test, see the docs"
    }
  },
  {
    "updateTextStyle": {
      "range": {"startIndex": 1, "endIndex": 29},
      "textStyle": {},
      "fields": "bold,italic,underline,strikethrough,weightedFontFamily,link"
    }
  },
  {
    "updateTextStyle": {
      "range": {"startIndex": 5, "endIndex": 14},
      "textStyle": {"weightedFontFamily": {"fontFamily": "Roboto Mono"}},
      "fields": "weightedFontFamily"
    }
  },
  {
    "updateTextStyle": {
      "range": {"startIndex": 20, "endIndex": 28},
      "textStyle": {"link": {"url": "https://example.com"}},
      "fields": "link"
    }
  },
  {
    "updateParagraphStyle": {
      "range": {"startIndex": 1, "endIndex": 29},
      "paragraphStyle": {"namedStyleType": "NORMAL_TEXT"},
      "fields": "namedStyleType"
    }
  },
  {"insertText": {"location": {"index": 1}, "text": "Notes\n"}},
  {
    "updateTextStyle": {
      "range": {"startIndex": 1, "endIndex": 7},
      "textStyle": {},
      "fields": "bold,italic,underline,strikethrough,weightedFontFamily,link"
    }
  },
  {
    "updateParagraphStyle": {
      "range": {"startIndex": 1, "endIndex": 7},
      "paragraphStyle": {"namedStyleType": "HEADING_2"},
      "fields": "namedStyleType"
    }
  }
]
```

#### How the requests are built

The requests build the document from the back. Each block is inserted at index 1, the start of the body, last block first, so the indexes of a block never depend on the blocks after it. For each block the requests insert its text, then set the text styles inside it, then set its paragraph style. Indexes count UTF-16 code units, the same unit as JavaScript's `string.length`, so `😀` takes two.

A new document already holds one empty paragraph. The last block is written into it, so the document gets no extra empty paragraph at the end. Every block before it brings its own paragraph. Every paragraph gets its paragraph style set, even a normal one, because a new paragraph otherwise takes the style of the paragraph it was split from. For the same reason, every paragraph's text and newline, the document's own paragraph included, are reset to plain text before its own styles are set.

A line break inside a span (`\n`) becomes a line break inside the paragraph. Control characters and Private Use Area characters, which Google Docs drops from inserted text, are left out.

#### Links

A `link` annotation is written as a link to its `href`. An `href` that doesn't look safe (anything but `http:`, `https:`, `mailto:`, `tel:`, a relative URL or a fragment) and a missing `href` are left out. The text stays and the loss is reported.

#### Schema

The `schema` option decides which styles, decorators and annotations are written:

```ts nocheck
import {portableTextToGoogleDocs} from '@portabletext/google-docs'
import {compileSchema, defineSchema} from '@portabletext/schema'

const schema = compileSchema(
  defineSchema({
    styles: [{name: 'normal'}, {name: 'h1'}, {name: 'h2'}],
    decorators: [{name: 'strong'}, {name: 'em'}],
    annotations: [{name: 'link', fields: [{name: 'href', type: 'string'}]}],
  }),
)

portableTextToGoogleDocs(blocks, {schema})
```

A style, decorator or annotation the schema doesn't declare is written as plain text and reported, even when Google Docs has a form for it. Without a `schema`, the default schema applies:

| Group         | Names                                                 |
| ------------- | ----------------------------------------------------- |
| `styles`      | `normal`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`          |
| `decorators`  | `strong`, `em`, `code`, `underline`, `strike-through` |
| `annotations` | `link` with `href`                                    |

#### Reporting degradation

Anything with no Google Docs form here degrades rather than throwing:

| `type`               | When                                                                                                         | Written as                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `style-fallback`     | a block style the schema doesn't declare or that has no Google Docs form                                     | normal text                      |
| `decorator-dropped`  | a decorator the schema doesn't declare or that has no Google Docs form                                       | the text, unformatted            |
| `annotation-dropped` | an annotation the schema doesn't declare, a `link` with an unsafe or missing `href`, or any other annotation | the text, unformatted            |
| `list-item-fallback` | any list item                                                                                                | a paragraph in the block's style |
| `object-dropped`     | any block object or inline object                                                                            | nothing                          |

`onDegradation` observes those losses. It's called once, after every block has been walked, only when at least one construct degraded, with a report object holding every `SerializeDegradation` in encounter order and a canonical grouped `message`. Left unset, the conversion stays silent and returns what it could write. Enforce against lossy output by throwing your own error from inside the callback. The throw propagates out of `portableTextToGoogleDocs`.

```ts nocheck
import {portableTextToGoogleDocs} from '@portabletext/google-docs'

portableTextToGoogleDocs(blocks, {
  onDegradation: ({degradations, message}) => {
    // degradations: every SerializeDegradation, in encounter order
    // message: the same degradations grouped, snippeted, and sorted by block
    throw new Error(message)
  },
})
```

Each `SerializeDegradation` carries `type`, a human-readable `message`, `path`, and `snippet` (the offending text, truncated to 40 characters) when there's a specific piece of text to quote. `path` addresses the node the loss occurred on, from the top-level `blocks` array down: an array position is `{_key: node._key}` when the node has a `_key`, the numeric index otherwise, and an object property is its field name. A mark covering several adjacent spans is reported once, on the first span. Match on `type`, not `message`: the type is the stable contract, the message can change between releases, and the set of `type` values itself grows in minor releases, so compare against the values you handle rather than switching exhaustively.

## License

MIT © [Sanity.io](https://www.sanity.io/)
