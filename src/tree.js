import ScopeStack from './scopeStack'

export default class Tree {
  constructor() {
    // holds a list of all child nodes
    this.children = []

    // holds a reference to all variables declared in the script
    // with the @ stripped off
    this.scopes = new ScopeStack()
  }

  get globals() {
    return this.scopes.first
  }

  toString() {
    let content = ''

    // Global variables
    for (let key of Object.keys(this.globals)) {
      content += `var $${key} = query('${this.globals[key]}')\n`
    }

    // String representation of all child nodes
    content += this.children.map(c => c.toString()).join('\n')

    return content
  }

  push(child) {
    this.children.push(child)
  }
}
