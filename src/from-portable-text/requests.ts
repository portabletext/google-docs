type Range = {startIndex: number; endIndex: number}

/**
 * The subset of the Docs API `TextStyle` this conversion writes.
 */
export type TextStyle = {
  bold?: true
  italic?: true
  underline?: true
  strikethrough?: true
  weightedFontFamily?: {fontFamily: string}
  link?: {url: string}
}

/**
 * The Docs API named styles this conversion writes.
 */
export type NamedStyleType =
  | 'NORMAL_TEXT'
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'HEADING_4'
  | 'HEADING_5'
  | 'HEADING_6'

/**
 * One entry of a `documents.batchUpdate` request body's `requests` array.
 */
export type GoogleDocsRequest =
  | {insertText: {location: {index: number}; text: string}}
  | {updateTextStyle: {range: Range; textStyle: TextStyle; fields: string}}
  | {
      updateParagraphStyle: {
        range: Range
        paragraphStyle: {namedStyleType: NamedStyleType}
        fields: 'namedStyleType'
      }
    }
