//
// TODO: All of this logic should go in the node bundle
//
// import fs from 'fs'
// import path from 'path'
// import split from 'split'
// import concat from 'concat-stream'
// import ReplaceStream from './utils/replaceStream'

import { types } from './lexer'
import Tree from './tree'

import BlockNode from './nodes/block'
import TriggerNode from './nodes/trigger'
import ReceiverNode from './nodes/receiver'
import TargetNode from './nodes/target'

const supportedActions = [
  'click', 'dblclick', 'mouseover', 'mouseenter', 'mouseexit'
]

const supportedTriggers = [
  'add', 'remove', 'toggle'
]

export default class Parser {
  constructor(lexer) {
    this.lexer = lexer

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
    if (this.lexer.empty()) { return }

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
  // Move to node specific
  //
  // write(fd = process.stdout, transformFunctions = []) {
  //   const template = path.resolve(__dirname, './templates/wrapper.js')
  //   const input = fs.createReadStream(template)

  //   // TODO: Move this into debug call
  //   console.log(this.ast.toString())

  //   input.pipe(split())
  //     .pipe(new ReplaceStream({
  //       content: this.ast.toString(),
  //       pattern: /---> uiscript$/
  //     }))
  //     .pipe(concat(function(output) {
  //       const transformed = transformFunctions.reduce((acc, fn) => fn(acc), output.toString())

  //       fd.write(transformed)
  //     }))
  // }

  //
  // Parses the variable and binds it with the current scope object
  //
  parseVariableAssignment() {
    let varName = this.lexer.nextToken()
    this.assert(varName.type, types.variableName)

    this.assert(this.lexer.nextToken().type, types.assignment)

    let varValue = this.lexer.nextToken()
    this.assert(varValue.type, types.string)

    this.ast.scopes.add(varName.value, varValue.value)
  }

  parseUiDeclaration() {
    this.assert(this.lexer.nextToken().type, types.declarationStart)
    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let action = this.lexer.nextToken()
    this.assert(action.type, types.string)
    this.assertSupportedAction(action.value)

    this.assert(this.lexer.nextToken().type, types.naturalLang)

    let target = this.lexer.nextToken()
    this.assert(target.type, [types.string, types.variableName])
    let type = target.type === types.string ? 'selector' : 'variable'
    let targetNode = new TargetNode(type, target.value)

    // Scope gate
    this.ast.scopes.addScope()

    this.parseBlock()

    let blockNode = new BlockNode(action.value, targetNode)

    while (this.blockStatements.length) {
      blockNode.addStatement(this.blockStatements.shift())
    }

    blockNode.scope = this.ast.scopes.removeScope()
    this.ast.push(blockNode)
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
        receiver = this.ast.scopes.fetch(reference)

        if (receiver === null) {
          this.error(`Found an unbound variable reference @${reference}`, reference)
        }

        receiver = new ReceiverNode('variable', reference)
      } else if (this.lexer.nextTokenType() === types.string) {
        receiver = new ReceiverNode('selector', this.lexer.nextToken().value)
      } else {
        this.unexpectedError()
      }
    }

    // bind any events to the current element in this block if no explicit reference given
    receiver = receiver || new ReceiverNode('implicit')

    let triggerNode = new TriggerNode(trigger.value, selector.value, receiver)
    this.blockStatements.push(triggerNode)
  }

  assertSupportedAction(action) {
    if (~supportedActions.indexOf(action)) { return }
    this.unexpectedError()
  }

  assertSupportedTrigger(trigger) {
    if (~supportedTriggers.indexOf(trigger)) { return }
    this.unexpectedError()
  }

  assert(actual, expected) {
    if (!Array.isArray(expected)) { expected = [expected] }
    if (~expected.indexOf(actual)) { return }

    let position = this.lexer.activeToken.position

    // Doing this right now for this problem https://github.com/nodejs/node/issues/927
    this.lexer.error(`Expected ${expected.toString()} at ${this.lexer.formatPosition(position)}`)
  }

  unexpectedError() {
    let position = this.lexer.activeToken.position
    this.lexer.error(`Unxpected token at ${this.lexer.formatPosition(position)}`)
  }

  error(text) {
    this.lexer.error(`Error: ${text}, at ${this.lexer.formatPosition()}`)
  }
}
