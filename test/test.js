'use strict'

const test = require('tap').test
const path = require('path')
const root = path.join(__dirname, '..')
const Check = require('../')

test('Check', (t) => {
  t.plan(7)
  t.throws(() => {
    Check()
  }, /missing required property "root"/)

  t.throws(() => {
    Check({
      root: __dirname
    })
  }, /Unable to read package.json/)

  const check = new Check({
    root: root
  })

  check.on('module', (mod) => {
    t.equal(mod.errors.length, 0, `${mod.relativePath} no errors`)
  })
})
