import type {SerializeDegradationType} from './degradation-report'

/**
 * Why a construct was left out: the schema doesn't declare it, or it is
 * declared but the conversion has no Google Docs form for it.
 */
type Cause = 'undeclared' | 'no-renderer'

/**
 * The full catalog of `SerializeDegradation['message']` prose, one entry
 * per `SerializeDegradationType`. Not exported from the package entry:
 * `message` is unstable by contract, so the catalog producing it stays
 * internal too.
 */
export const serializeDegradationMessage = {
  'annotation-dropped': (
    markType: string,
    cause: Cause | 'missing-url' | 'unsafe-url',
  ): string => {
    switch (cause) {
      case 'undeclared':
        return `Removed the \`${markType}\` annotation, kept its text: the schema has no \`${markType}\` annotation`
      case 'no-renderer':
        return `Removed the \`${markType}\` annotation, kept its text: no \`${markType}\` mark renderer`
      case 'missing-url':
        return 'Removed a link that has no URL, kept its text'
      case 'unsafe-url':
        return 'Removed a link with an unsafe URL, kept its text'
    }
  },

  'decorator-dropped': (markType: string, cause: Cause): string =>
    cause === 'undeclared'
      ? `Removed the \`${markType}\` decorator, kept the text: the schema has no \`${markType}\` decorator`
      : `Removed the \`${markType}\` decorator, kept the text: no \`${markType}\` mark renderer`,

  'style-fallback': (style: string, cause: Cause): string =>
    cause === 'undeclared'
      ? `Dropped the \`${style}\` style, kept the text: the schema has no \`${style}\` style`
      : `Dropped the \`${style}\` style, kept the text: no \`${style}\` block renderer`,

  'list-item-fallback': (listItem: string, cause: Cause): string =>
    cause === 'undeclared'
      ? `Wrote the \`${listItem}\` list item as a paragraph, kept the text: the schema has no \`${listItem}\` list`
      : `Wrote the \`${listItem}\` list item as a paragraph, kept the text: no \`${listItem}\` list-item renderer`,

  'object-dropped': (objectType: string, position: 'block' | 'inline') =>
    position === 'block'
      ? `Removed the \`${objectType}\` block object: no \`${objectType}\` renderer`
      : `Removed the inline \`${objectType}\` object: no \`${objectType}\` renderer`,
} satisfies Record<SerializeDegradationType, (...args: never[]) => string>
