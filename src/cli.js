#!/usr/bin/env node

import cli from 'commander'
import { glob as sync } from 'glob'
import { version, description } from '../package.json'
import run from '../dist/runner'

cli
  .version(version)
  .description(description)
  .usage('<files...> [options]')
  .option('-o, --out', 'List output destination.')
  .option('-w, --watch', 'Recompile files on changes')
  .option('-m, --minify', 'Minify output.')
  .parse(process.argv)

if (!cli.args.length) {
  cli.help()
}

const input = cli.args.reduce((globs, glob) => {
  let files = sync(glob)
  if (!files.length) { files = [glob] }
  return globs.concat(files)
}, [])

run(input, '.', {})
