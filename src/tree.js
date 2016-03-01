export default class Tree {
  constructor() {
    this.root = { globals: [] }
    this.children = []
  }

  toString() {
    let content = ''
    // TODO: insert global variables here
    content += this.children.map(c => c.toString()).join('\n')
    return content
  }

  push(child) {
    this.children.push(child)
  }
}
