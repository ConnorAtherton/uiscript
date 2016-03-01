import fs from 'fs'
import path from 'path'
import split from 'split'
import concat from 'concat-stream'
import { types } from './lexer'
import ScopeStack from './scopeStack'
import Tree from './tree'
import ReplaceStream from './utils/replaceStream'
import BlockNode from './nodes/block'
import TriggerNode from './nodes/trigger'

const supportedActions = [
  'click', 'dblclick', 'mouseover', 'mousein', 'mouseout'
]

const supportedTriggers = [
  'add', 'remove', 'toggle'
]

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer

    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.scopes = new ScopeStack()

    // list of block nodes for the program
    this.ast = new Tree()

    // holds all block declarations for the current block in scope
    this.blockStatements = []

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
        this.unexpectedError()
      }

      // fetch the next token if there is one
      type = this.lexer.empty() ? null : this.lexer.nextTokenType()
    }
  }

  //
  // Outputs to a file descriptor
  //
  write(fd = process.stdout, transformFunctions = []) {
    const template = path.resolve(__dirname, './templates/wrapper.js')
    const input = fs.createReadStream(template)
    const globals = this.scopes.first

    console.log(this.ast.toString())

    let content = ''

    // TODO: Add a root node and add all global variables there
    // for (let key of Object.keys(globals)) {
    //   content += `var $${key} = query('${globals[key]}')\n`
    // }

    input.pipe(split())
      .pipe(new ReplaceStream({
        content: this.ast.toString(),
        pattern: /---> uiscript$/
      }))
      .pipe(concat(function(output) {
        let transformed = transformFunctions.reduce((acc, fn) => {
          return fn(acc)
        }, output.toString())

        fd.write(transformed)
      }))
  }

  //
  // Parses the variable and binds it with the current scope object
  //
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
    this.assertSupportedAction(action.value)

    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    // Scope gate
    //
    // Inject the element inside the scope so we can implicitly
    // reference it later
    this.scopes.addScope({
      '__element__': selector.value
    })

    this.parseBlock()

    // let node = { trigger: [action.value, selector.value], actions: [] }
    let blockNode = new BlockNode(action.value, selector.value)

    while (this.blockStatements.length) {
      blockNode.addStatement(this.blockStatements.pop())
    }

    this.ast.push(blockNode)
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
    this.assertSupportedTrigger(trigger.value)

    let selector = this.lexer.nextToken()
    this.assert(selector.type, types.string)

    // Optional on clause
    if (this.lexer.nextTokenType() === types.naturalLang) {
      this.assert(this.lexer.nextToken().type, types.naturalLang)

      if (this.lexer.nextTokenType() === types.variableName) {
        let reference = this.lexer.nextToken().value
        receiver = this.scopes.fetch(reference)

        if (receiver === null) {
          this.error(`Found an unbound variable reference @${reference}`, reference)
        }
      } else if (this.lexer.nextTokenType() === types.string) {
        receiver = this.lexer.nextToken().value
      } else {
        this.unexpectedError()
      }
    }

    // bind any events to the current element in this block if no explicit reference given
    receiver = receiver || 'e.currentTarget'

    // TODO: add this to the graph
    // console.log(this.scopes)
    let triggerNode = new TriggerNode(trigger.value, selector.value, receiver)
    this.blockStatements.push(triggerNode)
  }

  assertSupportedAction(action) {
    if (~supportedActions.indexOf(action)) { return true }
    this.unexpectedError()
  }

  assertSupportedTrigger(trigger) {
    if (~supportedTriggers.indexOf(trigger)) { return true }
    this.unexpectedError()
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

  error(text) {
    let position = this.lexer.activeToken.position
    this.lexer.error(`Error: ${text}, at ${this.lexer.formatPosition()}`)
  }
}
