import { Transform as TransformStream } from 'stream'

export default class ReplaceStream extends TransformStream {
  constructor(opts = { content: '', pattern: /.*/ }) {
    super()

    this.content = opts.content
    this.pattern = opts.pattern
    this.inserting = false
  }

  _transform(chunk, encoding, done) {
    chunk = chunk.toString()

    if (chunk.match(this.pattern)) {
      this.inserting = true
      this.push(new Buffer(`${this.content}\n`))
    } else {
      // make sure to append a newline again after split
      this.push(new Buffer(chunk + '\n'))

      this.inserting = false
    }

    done()
  }

  _flush(done) { done() }
}
