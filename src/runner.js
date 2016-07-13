import path from 'path'
import fs from 'fs'
import hw from 'headway'
import chokidar from 'chokidar'
import Lexer from './lexer'
import Parser from './parser'
import { futils } from './utils/futils'

let watcher = null

const buildTransformPipeline = () => {
  return []
}

export default function run(input, options) {
  //
  // console.log(options)
  //
  //

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
        let transforms = buildTransformPipeline(options)

        parser.parse()
        parser.write(fd, transforms)

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
    console.log(`\n${values.length} files finished`)
  })
}

