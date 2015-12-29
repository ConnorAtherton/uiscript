export const formats = {
  variableName: 'abc',
  whitespace: ' \t\r\n',
  // take from the sizzle engine
}

export const keywords = {
  blockStart: 'then',
  blockEnd: 'end',
  addAction: 'add',
  removeAction: 'remove',
  toggleAction: 'toggle',
  uiDeclarationStart: 'when'
}

export const types = {
  variableName: Symbol('UI_VARIABLE_NAME'),
  string: Symbol('UI_STRING'),
  uiDeclarationStart: Symbol('UI_DECLARATION_START'),
  uiDeclarationEnd: Symbol('UI_DECLARATION_END')
}

//
// Lexer
//
// This is the class responsible for breaking up the
// input stream into tokens that the parser can recognize
// and use to run the program.
//
export default class Lexer {
  constructor(source) {
    // Force the source into a string so we can accept
    // a Buffer object as an input too
    this.source = source.toString()
    this.sourceLength = source.length

    // holds the position of the current character
    this.line = 0
    this.lineCharacter = 0

    // holds the position in the source string
    this.index = 0

    // stores all the tokens from the source
    this.tokens = []
  }

  position() {
    return {
      line: this.line,
      character: this.lineCharacter
    }
  }

  // increments to the next char in the source
  // and moves the index pointer to the next character
  next() {
    if (this.willOverflow()) { return null }
    let character = this.source[this.index++]

    // TODO: note down the current line and char number for debugging
    if (character === '\n') {
      this.line++
      this.lineCharacter = 0
    } else {
      this.lineCharacter++
    }

    return character
  }

  // returns the characters currently pointed at
  // without advancing the index
  peek() {
    if (this.willOverflow()) { return null }
    return this.source[this.index]
  }

  // Check that we don't try and advance the index
  // past the end of the file.
  willOverflow() {
    return this.index >= this.sourceLength
  }

  skipWhitespace() {
    while (formats.whitespace.includes(this.peek())) { this.next() }
  }

  skipLine() {
    while (this.next() !== '\n') {}
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

  // Finds and returns the next token in the input string. Will throw an
  // error if the token is malformed.
  tokenize() {
    let character = this.peek()

    if (character === '@') {
      return this.lexVariableName()
    } else if (character === '"') {
      return this.lexString()
    } else if (character === 't') {
      return this.declarationBlock()
    } else if (formats.whitespace.indexOf(character) !== -1) {
      this.skipWhitespace()
      return this.tokenize()
    } else if (character === '/') {
      this.lexComment()
      return this.scan()
    } else {
      // unknown character
      console.log('unknown character')
    }
  }

  //
  // Each method will lex through a unique token type
  //

  lexSingle() {
    let single = this.next()

    // this.assertType(single)

    return {
      type: types[single],
      value: single,
      position: this.position()
    }
  }

  lexVariableName() {
    let startPosition = this.position()
    // grab initial @
    let name = this.next()

    //
    // TODO: remove this lower case call
    //
    while (formats.variableName.includes(this.peek().toLowerCase())) {
      name += this.next()
    }

    return {
      type: types.variableName,
      value: name,
      position: startPosition
    }
  }

  lexString() {
    let startPosition = this.position()
    let string = ''
    this.next()

    while (this.r.peek() && this.r.peek() !== '"') {
      string += this.next()
    }

    if (this.next() !== '"') {
      this.errorExpected('"') // `Expect '"' at ${pos}, saw ${}`)
    }

    return {
      value: string,
      type: types.string,
      position: startPosition
    }
  }

  //
  // TODO: allow comments at the end of lines too
  //
  lexComment() {
    this.assert(this.lexer.next(), '/', (position) => {
      this.error(`Unexpected character '/' at ${position}`)
    })

    this.skipLine()
  }

  //
  // <ui_declaration> then
  //  <block_statement_list>
  // end
  //
  lexBlock() {
    this.lexBlockOpen()
    this.lexBlockStatements()
    this.lexBlockClose()
  }

  //
  // then
  //
  lexBlockOpen() {
    this.assertToken(keywords.blockStart)
  }

  //
  // end
  //
  lexBlockClose() {
    this.assertToken(keywords.blockEnd)
  }

  //
  // Statements list
  //
  lexBlockStatements() {
  }

  lexIndentifer() {
  }
}
