import type {NamedStyleType} from '../requests'

/**
 * The Docs named style each block style is written as. A Map, so a
 * schema-controlled name such as `constructor` can't resolve to an
 * inherited object property.
 */
export const namedStyleTypes = new Map<string, NamedStyleType>([
  ['normal', 'NORMAL_TEXT'],
  ['h1', 'HEADING_1'],
  ['h2', 'HEADING_2'],
  ['h3', 'HEADING_3'],
  ['h4', 'HEADING_4'],
  ['h5', 'HEADING_5'],
  ['h6', 'HEADING_6'],
])
