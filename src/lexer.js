export default function lex(glob) {

}

export const formats = {
  variableName: 'abc',
  whitespace: ' \t\r\n',
  // taken from the sizzle engine
  selector: ''
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
  uiDeclarationStart: Symbol('UI_DECLARATION_START')
}

//
// The actual lexer class
//
class Lexer {
  constructor(source) {
    // the string to break into tokens
    this.source = source
    this.sourceLength = source.length

    // holds the position of the current character
    this.line = 0
    this.lineCharacter = 0

    // holds the position in the source string
    this.index = 0
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
    character = this.source[this.index++]

    // TODO: note down the current line and char number for debugging
    if (character === '\n') {
      this.line++;
      this.lineCharacter = 0;
    } else {
      this.lineCharacter++;
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

  lex() {
    // TODO: do we want to take one full pase first removing
    // comments and empty lines?

    // let's take a look at the next token
    let cur = this.peek()
  }

  //
  // Each method will lex through a unique token type
  //

  lexName() {
    let position = this.position()
    let name = ''

    while (formats.variableName.includes(this.peek().toLowerCase()) {
      name += this.next()
    }

    return {
      type: types.variableName,
      value: name,
      position: position
    }
  }

  // TODO: allow comments at the end of lines too
  lexComment() {

  }

  // <ui_declaration> then
  //  <block_statement_list>
  // end
  lexBlock() {

  }

  //
  // then
  //
  lexBlockOpen() {
    this.assertToken(token.blockStart)
  }

  //
  // end
  //
  lexBlockClose() {
    this.assertToken(token.blockEnd)
  }

  lexIndentifer() {

  }

  //
  // Valid css selector (steal from sizzle)
  //
  lexSelector() {

  }
}
