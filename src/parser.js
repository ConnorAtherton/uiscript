import fs from 'fs'
import path from 'path'
import split from 'split'
import { types } from './lexer'
import ReplaceStream from './utils/replaceStream'
import ScopeStack from './scopeStack'

const supportedActions = [
  'click', 'dblclick', 'mouseover', 'mousein', 'mouseout'
]

const supportedTriggers = [
  'add', 'remove', 'toggle'
]

export default class Parser {
  constructor(lexer, writer = {}) {
    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.scopes = new ScopeStack()
    this.lexer = lexer
    this.writer = writer

    this.triggerStack = []
    this.ast = []

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
  write(fd = process.stdout) {
    const template = path.resolve(__dirname, './templates/wrapper.js')
    const input = fs.createReadStream(template)

    console.log(this.ast)

    // let output = fs.createWriteStream(fd, {
    //   flags: 'w+'
    // })

    let content = ''

    const globals = this.scopes.first

    for (let key of Object.keys(globals)) {
      content += `var $${key} = $('${globals[key]}')\n`
    }

    let info = this.ast[0]
    let body = info.actions.map(function(action) {
      return `    root.ui.dom['${action[0]}']($('${action[1]}'), 'class', '${action[2]}')`
    }).join('\n')

    content += `\n(function() {
  var $__selector__ = $('${info.trigger[1]}')
  root.ui.events.addEvent($__selector__, '${info.trigger[0]}', function(e) {
${body}
  })
})()\n`

    input.pipe(split())
      .pipe(new ReplaceStream({
        content: content.split('\n').map(l => `  ${l}`).join('\n'),
        pattern: /---> uiscript$/
      }))
      // .pipe(output)
      .pipe(fd)
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

    let node = { trigger: [action.value, selector.value], actions: [] }

    while (this.triggerStack.length) {
      let trigger = this.triggerStack.pop()
      node.actions.push(trigger)
    }

    this.ast.push(node)
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

    // bind any events to the current element in this block
    receiver = receiver || this.scopes.fetch('__element__')

    // TODO: add this to the graph
    // console.log(this.scopes)
    this.triggerStack.push([trigger.value, selector.value, receiver])
  }

  assertSupportedAction(action) {
    if (supportedActions.includes(action)) { return true }
    this.unexpectedError()
  }

  assertSupportedTrigger(trigger) {
    if (supportedTriggers.includes(trigger)) { return true }
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
