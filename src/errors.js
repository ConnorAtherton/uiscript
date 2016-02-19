const error = (name, code) => {
  return class UIScriptError extends Error {
    constructor(message) {
      super(`[uiscript] ${name}: ${message}`)
      this.status = code
    }
  }
}

export const Errors = {
  UnexpectedToken: error('ParseError', 1)
}
