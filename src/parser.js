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
  // This is for top level staments only - scope blocks are treated
  // differently
  parse() {
    if (this.lexer.empty()) { return true }

    // we know we have at least once token so don't need to type check
    let type = this.lexer.nextTokenType()

    while (type) {
      // @name ...
      if (type === types.variableName) {
        this.parseVariableAssignment()
      // when ...
      } else if (type === types.declarationStart) {
        this.parseUiDeclaration()
      } else if (type === types.EOF) {
        // reached the end
        break
      } else {
        this.error()
      }

      // fetch the next token if there is one
      type = this.lexer.empty() ? null : this.lexer.nextTokenType()
    }

    console.log('Parsing finished')
  }

  //
  // Parses the variable and binds it with the current scope object
  //
  parseVariableAssignment() {
    let varName = this.lexer.nextToken()
    this.assert(varName.type, types.variableName)
    console.log('variable ->', varName.value)

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

    //
    // TODO: Make sure the event is valid
    //
    // this.ensureSupportedAction(action)

    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    // Scope gate
    //
    // Inject the element inside the scope so we can implicitly
    // reference it later
    this.scopes.addScope({
      element: selector.value
    })

    this.parseBlock()

    // and remove the scope...
    this.scopes.removeScope()
  }

  parseBlock() {
    this.assert(this.lexer.nextToken().type, types.declarationBlockStart)
    let type = this.lexer.nextTokenType()

    // can I wrap this while inside a generator to automatically grab the next
    // token?
    while (type) {
      // @name ...
      if (type === types.variableName) {
        this.parseVariableAssignment()
      // add, remove, toggle ...
      } else if (type = types.trigger) {
        this.parseTriggerStatement()
      } else {
        // unexpected token
        // TODO: create method to throw unexpected token error
        this.error()
      }

      // fetch the next token if there is one
      type = this.lexer.empty() ? null : this.lexer.nextTokenType()

      // we need to escape out of this loop
      if (type === types.declarationBlockEnd) { break }
    }

    this.assert(this.lexer.nextToken().type, types.declarationBlockEnd)
  }

  // <action> <expression> (? on <variable_name>)
  // toggle ".is-open"
  // toggle ".is-open" on @element
  // toggle ".is-open" on ".different-element"
  parseTriggerStatement() {
    let receiver = null

    let trigger = this.lexer.nextToken()
    this.assert(trigger.type, types.trigger)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    // Optional on clause
    if (this.lexer.nextTokenType() === types.naturalLang) {
      this.assert(this.lexer.nextToken().type, types.naturalLang)

      if (this.lexer.nextTokenType() === types.variableName) {
        let reference = this.lexer.nextToken().value
        receiver = this.scopes.fetch(reference)
      } else if (this.lexer.nextTokenType() === types.string) {
        receiver = this.lexer.nextToken().value
      } else {
        this.unexpectedError()
      }
    }

    // bind any events to the current element in this block
    receiver = receiver || this.scopes.fetch('element')

    console.log('trigger', trigger.value, 'with', selector.value, 'on', receiver)
  }

  assert(actual, expected) {
    if (actual === expected) { return true }
    let position = this.lexer.activeToken.position

    // Doing this right now for this problem https://github.com/nodejs/node/issues/927
    this.lexer.error(`Expected ${expected.toString()} at ${this.lexer.formatPosition(position)}`)
  }

  unexpectedError() {
    let position = this.lexer.activeToken.position
    this.lexer.error(`Unxpected token at ${this.lexer.formatPosition(position)}`)
  }
}
