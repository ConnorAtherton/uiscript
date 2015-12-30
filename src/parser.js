import { types } from './lexer'

export default class Parser {
  constructor(lexer) {
    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.variables = {}
    this.lexer = lexer

    // split into tokens
    this.lexer.lex()
  }

  // Should always be called first
  // Each line should only begin with one of 3 tokens.
  parse() {
    let type = null

    console.log('begin parsing with tokens: \n', this.lexer.tokens)

    // while (type = this.lexer.peek().type) {
    //   // @name ...
    //   if (type === types.typeVariableName) {
    //     this.parseVariableAssignment()
    //   // when ...
    //   } else if (type === types,uiDeclarationStart) {
    //     this.parseUiDeclaration()
    //   } else {
    //     this.error()
    //   }
    // }
  }

  stripComment() {
    this.assert(this.lexer.next(), '/')
    this.lexer.skipLine()
  }

  parseVariableAssignment() {
    this.assert(this.lexer.next(), '@')
    let varName = this.parseVariableName()
    this.assert(this.lexer.next(), '=')
    let selector = this.parseSelectorString()

    // store this for later
    // TODO: querySelectorAll?
    variables[varName] = document.querySelector(selector)
  }

  parseSelectorString() {
    this.lexer.skipWhitespace()
    this.assert(this.lexer.next(), '"')

    this.assert(this.lexer.next(), '"')
  }

  parseBlock() {
    this.assertToken(keywords.blockStart)
    this.parseBlockStatements()
    this.assertToken(keywords.blockEnd)
  }

  parseBlockStatements() {


  }

  // <action> <expression> (? on <variable_name>)
  // toggle ".is-open"
  // toggle ".is-open" on @element
  // toggle ".is-open" on ".different-element"
  parseBlockStatement() {

  }

  assert(actual, expected) {
    if (actual.type === expected) { return true }
    this.lexer.error(`Expected ${expected} at ${actual.position}`)
  }

  // Ensures that the next token matches the token passed as the only argument
  // and throws an error otherwise.
  assertToken(token) {
    let len = token.length
    let acc = ''

    // there should be at least one token
    this.assert(this.lexer.next(), ' ')

    // skip all whitespace
    this.lexer.skipWhitespace()

    // skip len chars
    for (let i = 0; i < len; i++) { acc += this.lexer.next() }

    // now the two strings should equal each other
    this.assert(acc, token)
  }
}
