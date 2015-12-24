export default function parse() {

}

class Parser() {
  constructor(lexer) {
    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.variables = {}
    this.lexer = lexer
  }

  // Should always be called first
  parse() {
    let type = null

    while ((type = this.lexer.nextToken()).type) {
      // @name ...
      if (type = types.variableName) {
        this.parseVariableAssignment()
      // when ...
      } else if (type = ) {
        this.parseUiDeclaration()
      } else {
        this.error()
      }
    }
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

  // <action> <selector> (? on <variable_name>)
  parseBlockStatement() {

  }

  assert(actual, expected) {

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
