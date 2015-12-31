import { types } from './lexer'
import ScopeStack from './scopeStack'

export default class Parser {
  constructor(lexer) {
    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.scopes = new ScopeStack()
    this.lexer = lexer

    // split into tokens
    this.lexer.lex()
  }

  // Should always be called first
  // Each line should only begin with one of 3 tokens.
  parse() {
    if (this.lexer.empty()) { return true }

    // we know we have at least once token so don't need to type check
    let type = this.lexer.nextTokenType()

    while (type) {
      console.log(type)

      // @name ...
      if (type === types.variableName) {
        this.parseVariableAssignment()
      // when ...
      } else if (type === types.declarationStart) {
        this.parseUiDeclaration()
      } else {
        this.error()
      }

      // fetch the next token if there is one
      type = this.lexer.empty() ? null : this.lexer.nextTokenType()
    }
  }

  parseVariableAssignment() {
    let varName = this.lexer.nextToken()
    this.assert(varName.type, types.variableName)

    this.assert(this.lexer.nextToken().type, types.assignment)

    let varValue = this.lexer.nextToken()
    this.assert(varValue.type, types.string)

    this.scopes.add(varName.value, varValue.value)
  }

  parseUiDeclaration() {
    this.assert(this.lexer.nextToken().type, types.declarationStart)
    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let action = this.lexer.nextToken()
    this.assert(action.type, types.string)

    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    this.parseBlock()
  }

  parseBlock() {
    this.assert(this.lexer.nextToken().type, types.declarationBlockStart)

    // Scope gate..
    this.scopes.addScope()

    this.parseBlockStatements()
    this.assert(this.lexer.nextToken().type, types.declarationBlockStart)

    // TODO: we should remove the scope here
  }

  parseBlockStatements() {
    while (this.lexer.nextTokenType() === types.trigger) { this.parseBlockStatement() }
  }

  // <action> <expression> (? on <variable_name>)
  // toggle ".is-open"
  // toggle ".is-open" on @element
  // toggle ".is-open" on ".different-element"
  parseBlockStatement() {
    let trigger = this.lexer.nextToken()
    this.assert(trigger.type, types.trigger)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    // NOTE: optional and it will just be bound to the current event
  }

  assert(actual, expected) {
    if (actual === expected) { return true }
    // Doing this right now for this problem https://github.com/nodejs/node/issues/927
    this.lexer.error(`Expected ${String(expected)} at ${String(actual.position)}`)
  }
}
