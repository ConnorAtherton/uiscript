import fs from 'fs'
import { Lexer } from 'lexer'
import { Parser } from 'parser'

export default function run(globs) {
  globs.forEach(function(path) {
    fs.readFileSync(path)
      .then(source => {
        let lexer = new Lexer(source)
        let parser = new Parser(lexer)
        return parser.parse()
      })
      // .then(output())
      .catch(err => {
        console.log(err)
      })
  })
}
