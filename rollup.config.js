export default [
  {
    name: 'uiscript',
    input: './src/browser.js',
    output: {
      file: './dist/uiscript.js',
      format: 'iife'
    }
  },
  {
    input: './src/runner.js',
    external: ['path', 'fs', 'headway', 'chokidar', 'uglify-js'],
    output: {
      file: './dist/runner.js',
      format: 'cjs'
    }
  }
]
