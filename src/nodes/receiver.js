export default class ReceiverNode {
  constructor(type, value = 'e.currentTarget') {
    this.type = type
    this.value = value
  }

  toString() {
    switch (this.type) {
    case 'variable':
      return `$${this.value}`
      break
    case 'selector':
      return `query('${this.value}')`
      break
    case 'implicit':
      return this.value
    default:
      return console.error('Unexpected node type')
    }
  }
}
