import path from 'path'
import fs from 'fs'
import hw from 'headway'
import chokidar from 'chokidar'
import uglify from 'uglify-js'
import { futils } from './utils/futils'
import Lexer from './lexer'
import Parser from './parser'
import template from './templates/wrapper'

let watcher = null

const transforms = {
  minify: (str) => uglify.minify(str, { fromString: true }).code
}

const buildTransformPipeline = (options) => {
  return [
    options.minify && transforms.minify
  ].filter(Boolean)
}

const write = (astString, fd = process.stdout, transformFunctions = []) => {
  const transformed = transformFunctions
    .reduce((acc, fn) => fn(acc), astString)

  fd.write(template(transformed))
}

export default function run(input, options) {
  const promises = input.map(file => {
    return futils.exists(file)
      .then(() => futils.read(file))
      .then(source => {
        if (options.watch) {
          chokidar.watch(file, {
            persistent: true,
          }).on('all', function(type, filename) {
            //
            // Don't do anything if we remove the file
            //
            if (['add', 'change'].indexOf(type) !== -1) {
              console.log(filename, 'changed')
            }
          })
        }

        let lexer = new Lexer(source)
        let parser = new Parser(lexer)

        let newFile = file.toString().substr(0, file.lastIndexOf('.')) + '.js'
        let dest = path.join('.' || path.dirname(newFile), newFile)
        let fd = fs.createWriteStream(dest)
        let activeTransforms = buildTransformPipeline(options)

        parser.parse()
        write(parser.ast.toString(), fd, activeTransforms)

        hw.log(`{yellow}${file}{/} -> ${dest}`)

        return new Promise(resolve => resolve(true))
      })
      .catch(err => {
        console.error(err.stack)

        if (watcher) {
          watcher.close()
        }
      })
  })

  Promise.all(promises).then(function(values) {
    if (!options.watch) {
      console.log(`\n${values.length} files finished`)
    }
  })
}

