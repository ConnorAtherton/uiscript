import path from 'path'
import fs from 'fs'
import hw from 'headway'
import Lexer from './lexer'
import Parser from './parser'
import { futils } from './utils/futils'

function buildTransformPipeline(options) {
  return []
}

export default function run(input, outputDir, options) {
  input.forEach(file => {
    futils.exists(file)
      .then(() => futils.read(file) )
      .then(source => {
        let lexer = new Lexer(source)
        let parser = new Parser(lexer)

        let newFile = file.toString().substr(0, file.lastIndexOf('.')) + '.js'
        let dest = path.join(outputDir || path.dirname(newFile), newFile)
        let fd = fs.createWriteStream(dest)
        let transforms = buildTransformPipeline(options)

        parser.parse()
        parser.write(fd, transforms)

        hw.log(`{yellow}${file}{/} -> ${dest}`)
      })
      .catch(err => {
        console.error(err.stack)
      })
  })
}

