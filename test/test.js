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
  , fileFilter: (entry) => {
      if (entry.name === 'scoped.js' || path.extname(entry.path) !== '.js')
        return false

      return true
    }
  })

  check.on('module', (mod) => {
    t.equal(mod.errors.length, 0, `${mod.relativePath} no errors`)
  })
})

test('Check scoped', (t) => {
  t.plan(4)
  const check = new Check({
    root: root
  , package: path.join(__dirname, 'tpkg.json')
  , fileFilter: (entry) => {
      return entry.name === 'scoped.js'
    }
  })

  check.on('module', (mod) => {
    t.equal(mod.relativePath, 'test/scoped.js')
    t.equal(mod.errors.length, 1)
    const e = mod.errors[0]
    t.equal(e.type, 'module')
    t.equal(e.dependency, '@helpdotcom/biscuit/thing')
  })
})
