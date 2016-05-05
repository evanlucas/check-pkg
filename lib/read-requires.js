'use strict'

const fs = require('fs')
const detective = require('detective')

module.exports = function readRequires(fp, cb) {
  fs.readFile(fp, 'utf8', (err, str) => {
    if (err) return cb(err)
    cb(null, detective.find(str).strings)
  })
}
