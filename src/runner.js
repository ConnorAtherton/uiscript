import { lex } from 'lexer'
import parse from 'parser'
import fs from 'fs'

export default function run(globs, options = {}) {
  globs.forEach(function(path) {
    fs.read()
      .then(parse())
      .then(output())
      .catch(function(errorObject) {
        // print nice stack trace
      })
  })
}
