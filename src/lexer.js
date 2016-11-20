import range from './utils/range'
import hw from 'headway'

export const formats = {
  variableName: range('lowercase', 'uppercase'),
  whitespace: ' \t\r\n',
}

export const keywords = [
  'then', 'end', 'add',
  'remove', 'toggle', 'when',
  'I', 'on'
]

//
// Each keyword should respond to a type
//

// Since each Symbol is unique we need to share some here
// so we can use two alternate lexemes to represent a single
// node type.
const declarationBlockEndSymbol = Symbol('UI_DECLARATION_BLOCK_END')

export const types = {
  variableName: Symbol('UI_VARIABLE_NAME'),
  string: Symbol('UI_STRING'),
  declarationStart: Symbol('UI_DECLARATION_START'),
  declarationBlockStart: Symbol('UI_DECLARATION_BLOCK_START'),
  declarationBlockEnd: declarationBlockEndSymbol,
  '.': declarationBlockEndSymbol,
  trigger: Symbol('UI_TRIGGER'),
  '=': Symbol('UI_ASSIGNMENT'),
  // these tokens are just to keep the language sounding natural for
  // humans and the they are optional for the parser
  naturalLang: Symbol('UI_NATURAL_LANG'),

  // Special lexeme type
  EOF: Symbol('UI_EOF'),
}

//
// Keyword types mappings
//
// Keep these distinct from the actual types to make it easier
// to modify the keywords later on.
//
types.then = types.declarationBlockStart
types.end = types.declarationBlockEnd
types.add = types.trigger
types.remove = types.trigger
types.toggle = types.trigger
types.when = types.declarationStart
types.I = types.naturalLang
types.on = types.naturalLang
types.assignment = types['=']

//
// Lexer
//
// This is the class responsible for breaking up the
// input stream into tokens that the parser can recognize
// and use to run the program.
//
export default class Lexer {
  // @param {Buffer} source
  constructor(source) {
    // Force the source into a string so we can accept
    // a Buffer object as an input too
    this.source = source.toString()
    this.sourceLength = source.length

    // TODO: Support a debug flag to optionally enable this functionality.
    // Means we store the source twice in memory and make 2 passes instead of 1.
    this.linesForDebug = this.source.split('\n')

    // holds the position of the current character
    this.line = 1
    this.lineCharacter = 1

    // holds the position in the source string
    this.index = -1

    // stores all the tokens from the source
    this.tokens = []

    // Reference the current token the parse is considering
    this.activeToken = null
  }

  get position() {
    return {
      line: this.line,
      character: this.lineCharacter
    }
  }

  //
  // Increments to the next character in the token stream
  // and moves the increments the index pointer
  //
  next() {
    if (this.willOverflow()) { return null }
    let character = this.source[++this.index]

    // TODO: note down the current line and char number for debugging
    if (character === '\n') {
      this.line++
      this.lineCharacter = 0
    } else {
      this.lineCharacter++
    }

    return character
  }

  //
  // returns the character currently pointed at
  // without advancing the index
  //
  peek() {
    if (this.willOverflow()) { return null }
    return this.source[this.index + 1]
  }

  //
  // Shows the character at the current pointer position
  //
  current() {
    return this.source[this.index]
  }

  // Check that we don't try and advance the index
  // past the end of the file.
  willOverflow() {
    return this.index >= this.sourceLength - 1
  }

  skipWhitespace() {
    while (~formats.whitespace.indexOf(this.peek())) { this.next() }
  }

  skipLine() {
    while (this.next() !== '\n') {}
  }

  // Should be called after the tokens have been created
  nextToken() {
    this.activeToken = this.tokens.shift()
    return this.activeToken
  }

  nextTokenType() {
    return this.tokens[0].type
  }

  empty() {
    return !this.tokens.length
  }

  //
  // We'll do this using two passes and build the token stream
  // before the parser constructs the AST
  //
  lex() {
    while (!this.willOverflow()) {
      this.tokens.push(this.tokenize())
    }

    return this.tokens
  }

  // Finds and returns the next non-whitespace token in the input
  // string. Will throw an error if the token is malformed.
  tokenize() {
    let character = this.next()

    if (character === '@') {
      return this.lexVariableName()
    } else if (character === null) {
      return { val: null, type: types.EOF, position: this.position }
    } else if (character === '"' || character === "'") { // eslint-disable-line quotes
      return this.lexString()
    } else if (character === '/') {
      this.lexComment()
      return this.tokenize()
    } else if (~'=.'.indexOf(character)) {
      return this.lexSingle()
    } else if (~formats.whitespace.indexOf(character)) {
      this.skipWhitespace()
      return this.tokenize()
    } else if (this.keywordStart(character)) {
      return this.lexKeyword()
      throw Error
    } else {
      return console.error('unknown character', character)
    }
  }

  // returns all keywords that have *character* at the
  // *index* position
  keywordIndexMatch(character, index, keywordSet = keywords) {
    let acc = []

    for (let keyword of keywordSet) {
      // index out of bounds for the keyword
      if (index > keyword.length - 1) { continue }
      // character equality
      if (character === keyword[index]) { acc.push(keyword) }
    }

    return acc
  }

  // returns true if the character is the start of any keywords
  // in the language
  keywordStart(character) {
    return !!this.keywordIndexMatch(character, 0).length
  }

  lexKeyword() {
    let startPosition = this.position
    let index = 0
    let matches = this.keywordIndexMatch(this.current(), index)
    let finalMatch

    // tokens must be surrounded by whitespace
    while (matches.length && !~formats.whitespace.indexOf(this.peek())) {
      // increment both pointers at the same time
      this.next()
      index++

      // limit possible keywords to those already matched at lower indices
      matches = this.keywordIndexMatch(this.current(), index, matches)
    }

    finalMatch = matches[0]

    // if we have reached a space but the keyword isn't valid
    if (!finalMatch) { this.errorExpected('keyword', startPosition) }

    return {
      type: types[finalMatch],
      value: finalMatch,
      position: startPosition
    }
  }

  lexSingle() {
    let single = this.current()

    // this.assertType(single)

    return {
      type: types[single],
      value: single,
      position: this.position
    }
  }

  lexVariableName() {
    let startPosition = this.position
    let varName = this.next()

    // NOTE: ignore the initial @ symbol
    // but expect the next character to be valid
    if (!~formats.variableName.indexOf(varName)) {
      this.errorExpected('a valid variable name character')
    }

    while (~formats.variableName.indexOf(this.peek())) {
      varName += this.next()
    }

    return {
      type: types.variableName,
      value: varName,
      position: startPosition
    }
  }

  lexString() {
    // NOTE: This allows strings to use " or '
    const strOpen = this.current()
    let startPosition = this.position
    let string = this.next()

    while (this.peek() && this.peek() !== strOpen) {
      string += this.next()
    }

    if (this.next() !== strOpen) { this.errorExpected(strOpen) }

    return {
      value: string,
      type: types.string,
      position: startPosition
    }
  }

  //
  // NOTE: Comments are allowed at the end of a line too
  //
  lexComment() {
    this.assert(this.peek(), '/', () => {
      this.errorExpected('/')
    })

    // consume the next token and skip the rest of the line
    this.next()
    this.skipLine()
  }

  // asserts the equality of two values
  assert(actual, expected, func = function() {}) {
    if (actual !== expected) {
      func()
      return false
    }

    return true
  }

  error(message) {
    throw new Error(message)
  }

  errorExpected(expectStr, position = this.position) {
    hw.log('{_bold}' + this.linesForDebug[this.position.line - 1])
    hw.log('{red}' + ' '.repeat(this.position.character - 1) + '⇑')
    this.error(`Expected ${expectStr} at ${this.formatPosition(position)}`)
  }

  formatPosition(position = this.position) {
    return `L${position.line} C${position.character}`
  }
}
