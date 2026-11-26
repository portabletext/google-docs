import {
  compileSchema,
  defineSchema,
  type AnnotationDefinition,
  type DecoratorDefinition,
  type StyleDefinition,
} from '@portabletext/schema'

/********************
 * Default style definitions
 ********************/

const normalStyleDefinition = {
  name: 'normal',
} as const satisfies StyleDefinition

const h1StyleDefinition = {
  name: 'h1',
} as const satisfies StyleDefinition

const h2StyleDefinition = {
  name: 'h2',
} as const satisfies StyleDefinition

const h3StyleDefinition = {
  name: 'h3',
} as const satisfies StyleDefinition

const h4StyleDefinition = {
  name: 'h4',
} as const satisfies StyleDefinition

const h5StyleDefinition = {
  name: 'h5',
} as const satisfies StyleDefinition

const h6StyleDefinition = {
  name: 'h6',
} as const satisfies StyleDefinition

/********************
 * Default decorator definitions
 ********************/

const defaultStrongDecoratorDefinition = {
  name: 'strong',
} as const satisfies DecoratorDefinition

const defaultEmDecoratorDefinition = {
  name: 'em',
} as const satisfies DecoratorDefinition

const defaultCodeDecoratorDefinition = {
  name: 'code',
} as const satisfies DecoratorDefinition

const defaultStrikeThroughDecoratorDefinition = {
  name: 'strike-through',
} as const satisfies DecoratorDefinition

const defaultUnderlineDecoratorDefinition = {
  name: 'underline',
} as const satisfies DecoratorDefinition

/********************
 * Default annotation definitions
 ********************/

const defaultLinkObjectDefinition = {
  name: 'link',
  fields: [{name: 'href', type: 'string'}],
} as const satisfies AnnotationDefinition

/**
 * The default schema for converting Portable Text to Google Docs: every
 * style, decorator and annotation the conversion has a Google Docs form for.
 */
export const defaultSchema = compileSchema(
  defineSchema({
    styles: [
      normalStyleDefinition,
      h1StyleDefinition,
      h2StyleDefinition,
      h3StyleDefinition,
      h4StyleDefinition,
      h5StyleDefinition,
      h6StyleDefinition,
    ],
    decorators: [
      defaultStrongDecoratorDefinition,
      defaultEmDecoratorDefinition,
      defaultCodeDecoratorDefinition,
      defaultStrikeThroughDecoratorDefinition,
      defaultUnderlineDecoratorDefinition,
    ],
    annotations: [defaultLinkObjectDefinition],
  }),
)
