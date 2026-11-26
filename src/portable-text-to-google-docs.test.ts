import {compileSchema, defineSchema} from '@portabletext/schema'
import {describe, expect, test, vi} from 'vitest'
import {portableTextToGoogleDocs} from './index'

describe(portableTextToGoogleDocs.name, () => {
  describe('text blocks', () => {
    test('Scenario: no blocks write nothing', () => {
      expect(portableTextToGoogleDocs([])).toEqual([])
    })

    test('Scenario: one paragraph fills the empty paragraph of a new document', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [{_type: 'span', _key: 's1', text: 'Hello', marks: []}],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Hello'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: a block without a style is a normal paragraph', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            children: [{_type: 'span', _key: 's1', text: 'Plain', marks: []}],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Plain'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: every heading style becomes its Heading named style, last block first', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'h1',
            children: [{_type: 'span', _key: 's1', text: 'H1', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b2',
            style: 'h2',
            children: [{_type: 'span', _key: 's2', text: 'H2', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b3',
            style: 'h3',
            children: [{_type: 'span', _key: 's3', text: 'H3', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b4',
            style: 'h4',
            children: [{_type: 'span', _key: 's4', text: 'H4', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b5',
            style: 'h5',
            children: [{_type: 'span', _key: 's5', text: 'H5', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b6',
            style: 'h6',
            children: [{_type: 'span', _key: 's6', text: 'H6', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b7',
            style: 'normal',
            children: [{_type: 'span', _key: 's7', text: 'Body', marks: []}],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Body'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H6\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_6'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H5\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_5'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H4\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_4'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H3\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_3'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H2\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_2'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'H1\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'HEADING_1'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: marks in an earlier block are placed from index 1, independent of the blocks after it', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'First ', marks: []},
              {_type: 'span', _key: 's2', text: 'bold', marks: ['strong']},
            ],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b2',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's3', text: 'Second ', marks: []},
              {_type: 'span', _key: 's4', text: 'italic', marks: ['em']},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Second italic'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 15},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 8, endIndex: 14},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 15},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'First bold\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 12},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 7, endIndex: 11},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 12},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: an empty paragraph between a heading and a paragraph gets its own normal style', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'h1',
            children: [{_type: 'span', _key: 's1', text: 'Title', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b2',
            style: 'normal',
            children: [{_type: 'span', _key: 's2', text: '', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b3',
            style: 'normal',
            children: [{_type: 'span', _key: 's3', text: 'Body', marks: []}],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Body'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: '\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 2},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 2},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'Title\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'HEADING_1'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: an empty last block only resets and styles the paragraph the document already has', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'h2',
            children: [{_type: 'span', _key: 's1', text: 'Heading', marks: []}],
            markDefs: [],
          },
          {
            _type: 'block',
            _key: 'b2',
            style: 'normal',
            children: [],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 2},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 2},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'Heading\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 9},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 9},
            paragraphStyle: {namedStyleType: 'HEADING_2'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: a line break inside a span becomes a vertical tab, the Docs line break', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'one\ntwo', marks: []},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'one\u000btwo'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 9},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 9},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: control characters Docs strips on insert are left out, so later indexes stay right', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {
                _type: 'span',
                _key: 's1',
                text: `a${String.fromCharCode(0x0, 0xe000)}b `,
                marks: [],
              },
              {_type: 'span', _key: 's2', text: 'bold', marks: ['strong']},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'ab bold'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 9},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 4, endIndex: 8},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 9},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })
  })

  describe('marks', () => {
    test('Scenario: every decorator becomes its text style', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'a', marks: ['strong']},
              {_type: 'span', _key: 's2', text: ' ', marks: []},
              {_type: 'span', _key: 's3', text: 'b', marks: ['em']},
              {_type: 'span', _key: 's4', text: ' ', marks: []},
              {_type: 'span', _key: 's5', text: 'c', marks: ['code']},
              {_type: 'span', _key: 's6', text: ' ', marks: []},
              {_type: 'span', _key: 's7', text: 'd', marks: ['underline']},
              {_type: 'span', _key: 's8', text: ' ', marks: []},
              {
                _type: 'span',
                _key: 's9',
                text: 'e',
                marks: ['strike-through'],
              },
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'a b c d e'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 11},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 2},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 3, endIndex: 4},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 5, endIndex: 6},
            textStyle: {weightedFontFamily: {fontFamily: 'Roboto Mono'}},
            fields: 'weightedFontFamily',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 7, endIndex: 8},
            textStyle: {underline: true},
            fields: 'underline',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 9, endIndex: 10},
            textStyle: {strikethrough: true},
            fields: 'strikethrough',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 11},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: overlapping marks become one range each, spanning every span they cover', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'bold ', marks: ['strong']},
              {
                _type: 'span',
                _key: 's2',
                text: 'both',
                marks: ['strong', 'em'],
              },
              {_type: 'span', _key: 's3', text: ' italic', marks: ['em']},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'bold both italic'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 18},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 10},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 6, endIndex: 17},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 18},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: adjacent spans with different marks meet at the same index', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'left', marks: ['strong']},
              {_type: 'span', _key: 's2', text: 'right', marks: ['code']},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'leftright'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 11},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 5},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 5, endIndex: 10},
            textStyle: {weightedFontFamily: {fontFamily: 'Roboto Mono'}},
            fields: 'weightedFontFamily',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 11},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: a mark that stops and starts again becomes two ranges', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'one', marks: ['em']},
              {_type: 'span', _key: 's2', text: ' and ', marks: []},
              {_type: 'span', _key: 's3', text: 'two', marks: ['em']},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'one and two'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 13},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 9, endIndex: 12},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 13},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: a mark on an empty span writes no range', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'a', marks: []},
              {_type: 'span', _key: 's2', text: '', marks: ['strong']},
              {_type: 'span', _key: 's3', text: 'b', marks: []},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'ab'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 4},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 4},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: a link becomes a link text style, together with a decorator on the same text', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'Read ', marks: []},
              {
                _type: 'span',
                _key: 's2',
                text: 'the docs',
                marks: ['l1', 'strong'],
              },
              {_type: 'span', _key: 's3', text: '.', marks: []},
            ],
            markDefs: [
              {_type: 'link', _key: 'l1', href: 'https://example.com/docs'},
            ],
          },
        ]),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Read the docs.'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 16},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 6, endIndex: 14},
            textStyle: {link: {url: 'https://example.com/docs'}},
            fields: 'link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 6, endIndex: 14},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 16},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })

    test('Scenario: characters outside the Basic Multilingual Plane count as two indexes, before and after marks', () => {
      expect(
        portableTextToGoogleDocs([
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'astral 😀 ', marks: []},
              {_type: 'span', _key: 's2', text: 'bold 😀', marks: ['strong']},
              {_type: 'span', _key: 's3', text: ' after 😀', marks: []},
            ],
            markDefs: [],
          },
        ]),
      ).toEqual([
        {
          insertText: {
            location: {index: 1},
            text: 'astral 😀 bold 😀 after 😀',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 28},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 11, endIndex: 18},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 28},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
    })
  })

  describe('degradations', () => {
    test('Scenario: an unsafe link keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'Click ', marks: []},
                {_type: 'span', _key: 's2', text: 'here', marks: ['l1']},
              ],
              markDefs: [
                {_type: 'link', _key: 'l1', href: 'javascript:alert(1)'},
              ],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Click here'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 12},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 12},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'annotation-dropped',
                message: 'Removed a link with an unsafe URL, kept its text',
                path: [{_key: 'b1'}, 'children', {_key: 's2'}],
                snippet: 'here',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed a link with an unsafe URL, kept its text ("here")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a link without an href keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'nowhere', marks: ['l1']},
              ],
              markDefs: [{_type: 'link', _key: 'l1'}],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'nowhere'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 9},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 9},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'annotation-dropped',
                message: 'Removed a link that has no URL, kept its text',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'nowhere',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed a link that has no URL, kept its text ("nowhere")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: an annotation the schema does not declare keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'noted', marks: ['c1']},
              ],
              markDefs: [{_type: 'comment', _key: 'c1', text: 'Check this'}],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'noted'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'annotation-dropped',
                message:
                  'Removed the `comment` annotation, kept its text: the schema has no `comment` annotation',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'noted',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `comment` annotation, kept its text: the schema has no `comment` annotation ("noted")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: an annotation the schema declares but has no Google Docs form keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'noted', marks: ['c1']},
              ],
              markDefs: [{_type: 'comment', _key: 'c1', text: 'Check this'}],
            },
          ],
          {
            schema: compileSchema(
              defineSchema({
                annotations: [
                  {name: 'comment', fields: [{name: 'text', type: 'string'}]},
                ],
              }),
            ),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'noted'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'annotation-dropped',
                message:
                  'Removed the `comment` annotation, kept its text: no `comment` mark renderer',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'noted',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `comment` annotation, kept its text: no `comment` mark renderer ("noted")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a link on a schema without a link annotation keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'site', marks: ['l1']},
              ],
              markDefs: [
                {_type: 'link', _key: 'l1', href: 'https://example.com'},
              ],
            },
          ],
          {schema: compileSchema(defineSchema({})), onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'site'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'annotation-dropped',
                message:
                  'Removed the `link` annotation, kept its text: the schema has no `link` annotation',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'site',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `link` annotation, kept its text: the schema has no `link` annotation ("site")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a decorator the schema does not declare keeps its text and is reported once per run', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'high', marks: ['highlight']},
                {
                  _type: 'span',
                  _key: 's2',
                  text: 'lit',
                  marks: ['highlight', 'strong'],
                },
              ],
              markDefs: [],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'highlit'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 9},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 5, endIndex: 8},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 9},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'highlit',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator ("highlit")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a default decorator a custom schema leaves out keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'loud', marks: ['strong']},
                {_type: 'span', _key: 's2', text: 'soft', marks: ['em']},
              ],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(defineSchema({decorators: [{name: 'em'}]})),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'loudsoft'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 10},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 5, endIndex: 9},
            textStyle: {italic: true},
            fields: 'italic',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 10},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `strong` decorator, kept the text: the schema has no `strong` decorator',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'loud',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `strong` decorator, kept the text: the schema has no `strong` decorator ("loud")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a decorator the schema declares but has no Google Docs form keeps its text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 's1',
                  text: 'marked',
                  marks: ['highlight'],
                },
              ],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(
              defineSchema({decorators: [{name: 'highlight'}]}),
            ),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'marked'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 8},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 8},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `highlight` decorator, kept the text: no `highlight` mark renderer',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'marked',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `highlight` decorator, kept the text: no `highlight` mark renderer ("marked")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a style the schema does not declare becomes normal text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'blockquote',
              children: [
                {_type: 'span', _key: 's1', text: 'Quoted', marks: []},
              ],
              markDefs: [],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Quoted'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 8},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 8},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'style-fallback',
                message:
                  'Dropped the `blockquote` style, kept the text: the schema has no `blockquote` style',
                path: [{_key: 'b1'}],
                snippet: 'Quoted',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Dropped the `blockquote` style, kept the text: the schema has no `blockquote` style ("Quoted")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a heading a custom schema leaves out becomes normal text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'h4',
              children: [{_type: 'span', _key: 's1', text: 'Deep', marks: []}],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(defineSchema({styles: [{name: 'h1'}]})),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Deep'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'style-fallback',
                message:
                  'Dropped the `h4` style, kept the text: the schema has no `h4` style',
                path: [{_key: 'b1'}],
                snippet: 'Deep',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Dropped the `h4` style, kept the text: the schema has no `h4` style ("Deep")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a style the schema declares but has no Google Docs form becomes normal text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'blockquote',
              children: [
                {_type: 'span', _key: 's1', text: 'Quoted', marks: []},
              ],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(
              defineSchema({styles: [{name: 'blockquote'}]}),
            ),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Quoted'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 8},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 8},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'style-fallback',
                message:
                  'Dropped the `blockquote` style, kept the text: no `blockquote` block renderer',
                path: [{_key: 'b1'}],
                snippet: 'Quoted',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Dropped the `blockquote` style, kept the text: no `blockquote` block renderer ("Quoted")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a declared style named after an inherited object property becomes normal text and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'constructor',
              children: [{_type: 'span', _key: 's1', text: 'x', marks: []}],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(
              defineSchema({styles: [{name: 'constructor'}]}),
            ),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'x'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 3},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 3},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'style-fallback',
                message:
                  'Dropped the `constructor` style, kept the text: no `constructor` block renderer',
                path: [{_key: 'b1'}],
                snippet: 'x',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Dropped the `constructor` style, kept the text: no `constructor` block renderer ("x")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: declared decorators named after inherited object properties keep their text and are reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {
                  _type: 'span',
                  _key: 's1',
                  text: 'x',
                  marks: ['constructor', 'toString'],
                },
              ],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(
              defineSchema({
                decorators: [{name: 'constructor'}, {name: 'toString'}],
              }),
            ),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'x'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 3},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 3},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `constructor` decorator, kept the text: no `constructor` mark renderer',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'x',
              },
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `toString` decorator, kept the text: no `toString` mark renderer',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'x',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `constructor` decorator, kept the text: no `constructor` mark renderer ("x")',
              '- block 0: Removed the `toString` decorator, kept the text: no `toString` mark renderer ("x")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a list item becomes a paragraph in its own style and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              listItem: 'bullet',
              level: 1,
              children: [{_type: 'span', _key: 's1', text: 'Item', marks: []}],
              markDefs: [],
            },
            {
              _type: 'block',
              _key: 'b2',
              style: 'h3',
              listItem: 'number',
              level: 2,
              children: [{_type: 'span', _key: 's2', text: 'Step', marks: []}],
              markDefs: [],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Step'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'HEADING_3'},
            fields: 'namedStyleType',
          },
        },
        {insertText: {location: {index: 1}, text: 'Item\n'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'list-item-fallback',
                message:
                  'Wrote the `bullet` list item as a paragraph, kept the text: the schema has no `bullet` list',
                path: [{_key: 'b1'}],
                snippet: 'Item',
              },
              {
                type: 'list-item-fallback',
                message:
                  'Wrote the `number` list item as a paragraph, kept the text: the schema has no `number` list',
                path: [{_key: 'b2'}],
                snippet: 'Step',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Wrote the `bullet` list item as a paragraph, kept the text: the schema has no `bullet` list ("Item")',
              '- block 1: Wrote the `number` list item as a paragraph, kept the text: the schema has no `number` list ("Step")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a list item the schema declares becomes a paragraph and is reported', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              listItem: 'bullet',
              level: 1,
              children: [{_type: 'span', _key: 's1', text: 'Item', marks: []}],
              markDefs: [],
            },
          ],
          {
            schema: compileSchema(defineSchema({lists: [{name: 'bullet'}]})),
            onDegradation,
          },
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Item'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'list-item-fallback',
                message:
                  'Wrote the `bullet` list item as a paragraph, kept the text: no `bullet` list-item renderer',
                path: [{_key: 'b1'}],
                snippet: 'Item',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Wrote the `bullet` list item as a paragraph, kept the text: no `bullet` list-item renderer ("Item")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a block object is written as nothing and is reported, and the last text block still fills the empty paragraph', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [{_type: 'span', _key: 's1', text: 'Above', marks: []}],
              markDefs: [],
            },
            {
              _type: 'image',
              _key: 'i1',
              src: 'https://example.com/diagram.png',
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Above'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 7},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 7},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'object-dropped',
                message:
                  'Removed the `image` block object: no `image` renderer',
                path: [{_key: 'i1'}],
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 1: Removed the `image` block object: no `image` renderer',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: an inline object is written as nothing and is reported, and a mark around it stays one range', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 's1', text: 'Hi ', marks: ['strong']},
                {_type: 'mention', _key: 'm1', name: 'Ada'},
                {_type: 'span', _key: 's2', text: '!', marks: ['strong']},
              ],
              markDefs: [],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'Hi !'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 6},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 5},
            textStyle: {bold: true},
            fields: 'bold',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 6},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'object-dropped',
                message:
                  'Removed the inline `mention` object: no `mention` renderer',
                path: [{_key: 'b1'}, 'children', {_key: 'm1'}],
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the inline `mention` object: no `mention` renderer',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: only block objects write nothing at all', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs([{_type: 'horizontal-rule', _key: 'h1'}], {
          onDegradation,
        }),
      ).toEqual([])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'object-dropped',
                message:
                  'Removed the `horizontal-rule` block object: no `horizontal-rule` renderer',
                path: [{_key: 'h1'}],
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `horizontal-rule` block object: no `horizontal-rule` renderer',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: keyless nodes are addressed by their index', () => {
      const onDegradation = vi.fn()

      portableTextToGoogleDocs(
        [
          {
            _type: 'block',
            style: 'normal',
            children: [{_type: 'span', text: 'x', marks: ['highlight']}],
            markDefs: [],
          },
        ],
        {onDegradation},
      )

      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator',
                path: [0, 'children', 0],
                snippet: 'x',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator ("x")',
            ].join('\n'),
          },
        ],
      ])
    })
  })

  describe('onDegradation', () => {
    test('Scenario: it is not called when nothing degrades', () => {
      const onDegradation = vi.fn()

      portableTextToGoogleDocs(
        [
          {
            _type: 'block',
            _key: 'b1',
            style: 'h1',
            children: [
              {_type: 'span', _key: 's1', text: 'Fine', marks: ['em']},
            ],
            markDefs: [],
          },
        ],
        {onDegradation},
      )

      expect(onDegradation.mock.calls).toEqual([])
    })

    test('Scenario: it is called once, after the whole walk, with every degradation in encounter order and a grouped message', () => {
      const onDegradation = vi.fn()

      portableTextToGoogleDocs(
        [
          {
            _type: 'block',
            _key: 'b1',
            style: 'normal',
            children: [
              {_type: 'span', _key: 's1', text: 'one', marks: ['highlight']},
            ],
            markDefs: [],
          },
          {_type: 'image', _key: 'i1'},
          {
            _type: 'block',
            _key: 'b2',
            style: 'blockquote',
            children: [
              {_type: 'span', _key: 's2', text: 'two', marks: ['highlight']},
            ],
            markDefs: [],
          },
        ],
        {onDegradation},
      )

      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator',
                path: [{_key: 'b1'}, 'children', {_key: 's1'}],
                snippet: 'one',
              },
              {
                type: 'object-dropped',
                message:
                  'Removed the `image` block object: no `image` renderer',
                path: [{_key: 'i1'}],
              },
              {
                type: 'style-fallback',
                message:
                  'Dropped the `blockquote` style, kept the text: the schema has no `blockquote` style',
                path: [{_key: 'b2'}],
                snippet: 'two',
              },
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator',
                path: [{_key: 'b2'}, 'children', {_key: 's2'}],
                snippet: 'two',
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- Removed the `highlight` decorator, kept the text: the schema has no `highlight` decorator (2×: "one", "two")',
              '- block 1: Removed the `image` block object: no `image` renderer',
              '- block 2: Dropped the `blockquote` style, kept the text: the schema has no `blockquote` style ("two")',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: overlapping unsupported marks and an object after them are reported in the order they are first encountered', () => {
      const onDegradation = vi.fn()

      expect(
        portableTextToGoogleDocs(
          [
            {
              _type: 'block',
              _key: 'b1',
              style: 'normal',
              children: [
                {_type: 'span', _key: 'sA', text: 'one ', marks: ['unknownA']},
                {
                  _type: 'span',
                  _key: 'sB',
                  text: 'two ',
                  marks: ['unknownA', 'unknownB'],
                },
                {_type: 'span', _key: 'sC', text: 'three', marks: ['unknownA']},
                {_type: 'image', _key: 'i1'},
              ],
              markDefs: [],
            },
          ],
          {onDegradation},
        ),
      ).toEqual([
        {insertText: {location: {index: 1}, text: 'one two three'}},
        {
          updateTextStyle: {
            range: {startIndex: 1, endIndex: 15},
            textStyle: {},
            fields:
              'bold,italic,underline,strikethrough,weightedFontFamily,link',
          },
        },
        {
          updateParagraphStyle: {
            range: {startIndex: 1, endIndex: 15},
            paragraphStyle: {namedStyleType: 'NORMAL_TEXT'},
            fields: 'namedStyleType',
          },
        },
      ])
      expect(onDegradation.mock.calls).toEqual([
        [
          {
            degradations: [
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `unknownA` decorator, kept the text: the schema has no `unknownA` decorator',
                path: [{_key: 'b1'}, 'children', {_key: 'sA'}],
                snippet: 'one two three',
              },
              {
                type: 'decorator-dropped',
                message:
                  'Removed the `unknownB` decorator, kept the text: the schema has no `unknownB` decorator',
                path: [{_key: 'b1'}, 'children', {_key: 'sB'}],
                snippet: 'two ',
              },
              {
                type: 'object-dropped',
                message:
                  'Removed the inline `image` object: no `image` renderer',
                path: [{_key: 'b1'}, 'children', {_key: 'i1'}],
              },
            ],
            message: [
              'Portable Text could not be converted to Google Docs without loss:',
              '- block 0: Removed the `unknownA` decorator, kept the text: the schema has no `unknownA` decorator ("one two three")',
              '- block 0: Removed the `unknownB` decorator, kept the text: the schema has no `unknownB` decorator ("two ")',
              '- block 0: Removed the inline `image` object: no `image` renderer',
            ].join('\n'),
          },
        ],
      ])
    })

    test('Scenario: a throw from it propagates out of the conversion', () => {
      expect(() =>
        portableTextToGoogleDocs([{_type: 'image', _key: 'i1'}], {
          onDegradation: ({message}) => {
            throw new Error(message)
          },
        }),
      ).toThrowError(
        [
          'Portable Text could not be converted to Google Docs without loss:',
          '- block 0: Removed the `image` block object: no `image` renderer',
        ].join('\n'),
      )
    })
  })
})
