import type {TextStyle} from '../requests'

/**
 * Docs has no notion of inline code, only fonts, so `code` is written as a
 * monospace font.
 */
const CODE_FONT_FAMILY = 'Roboto Mono'

/**
 * The Docs text style each decorator is written as, and the `fields` mask
 * naming the one property it sets. A Map, so a schema-controlled name
 * such as `constructor` can't resolve to an inherited object property.
 */
export const decoratorTextStyles = new Map<
  string,
  {textStyle: TextStyle; fields: string}
>([
  ['strong', {textStyle: {bold: true}, fields: 'bold'}],
  ['em', {textStyle: {italic: true}, fields: 'italic'}],
  ['underline', {textStyle: {underline: true}, fields: 'underline'}],
  [
    'strike-through',
    {textStyle: {strikethrough: true}, fields: 'strikethrough'},
  ],
  [
    'code',
    {
      textStyle: {weightedFontFamily: {fontFamily: CODE_FONT_FAMILY}},
      fields: 'weightedFontFamily',
    },
  ],
])

/**
 * Every text style property the conversion writes. Text inserted in front
 * of a paragraph already in the document can take on that paragraph's
 * text style, so each such run is reset to the defaults for these first.
 */
export const writtenTextStyleFields =
  'bold,italic,underline,strikethrough,weightedFontFamily,link'
