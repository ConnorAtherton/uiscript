//
// Copied without shame from https://github.com/mjmlio/mjml
//

import fs from 'fs'

const promisify = fn =>
  (...args) =>
    new Promise((resolve, reject) =>
      fn(...args.concat((err, ...data) =>
        err ? reject(err) : resolve(...data))))

export const futils = {
  read: promisify(fs.readFile),
  exists: promisify((file, cb) => fs.access(file, fs.R_OK | fs.W_OK, cb))
}
