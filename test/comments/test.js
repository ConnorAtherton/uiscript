import fs from 'fs'
import path from 'path'
import Lexer from '../../dist/lexer'
import Parser from '../../dist/parser'

let fp = path.resolve(__dirname, './onlyComment.ui')

fs.readFile(fp, function(err, source) {
  if (err && err.code === 'ENOENT') { console.log('file not found') }
  console.log(source)

  let lexer = new Lexer(source)
  let parser = new Parser(lexer)

  // Print every character
  //
  // do {
  //   console.log(lexer.peek())
  // } while (lexer.next())

  parser.parse()
})