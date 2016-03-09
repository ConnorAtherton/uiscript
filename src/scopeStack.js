export default class ScopeStack {
  constructor() {
    this.scopes = []

    // Add the root scope automatically
    this.addScope()
  }

  get first() {
    return this.scopes[0]
  }

  get last() {
    return this.scopes[this.scopes.length - 1]
  }

  addScope(scope = {}) {
    return this.scopes.push(scope)
  }

  removeScope() {
    return this.scopes.pop()
  }

  add(key, val) {
    this.last[key] = val
  }

  remove() {
    return this.scopes.shift()
  }

  // reaches up through the scope chain
  fetch(key) {
    let len = this.scopes.length

    while (len--) {
      if (this.scopes[len][key]) { return this.scopes[len][key] }
    }

    return null
  }
}
