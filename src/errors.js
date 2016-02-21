const error = name => {
  return class UIScriptError extends Error {
    constructor(message) {
      super(`[uiscript] ${name}: ${message}`)
    }
  }
}

export const Errors = {
  UnexpectedToken: error('UnexpectedToken')
}
