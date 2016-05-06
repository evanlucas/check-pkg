'use strict'

const test = require('tap').test
const path = require('path')
const root = path.join(__dirname, '..')
const Check = require('../')

test('Check', (t) => {
  t.plan(8)
  t.throws(() => {
    Check()
  }, /missing required property "root"/)

  Check({
    root: __dirname
  }).once('error', (err) => {
    t.pass('got error event')
    t.equal(err.code, 'ENOENT')
  })

  const check = new Check({
    root: root
  })

  check.on('module', (mod) => {
    t.equal(mod.errors.length, 0, `${mod.relativePath} no errors`)
  })
})
