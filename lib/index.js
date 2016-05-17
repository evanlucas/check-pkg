'use strict'

const EE = require('events')
const inherits = require('util').inherits
const fs = require('fs')
const path = require('path')
const Transform = require('stream').Transform
const readdirp = require('readdirp')
const resolveFrom = require('resolve-from')
const readRequires = require('./read-requires')

// TODO(evanlucas) watch for when process.binding('natives') gets
// deprecated and/or removed
const internalModules = new Set(Object.keys(process.binding('natives')))

module.exports = Check

const defaultDirFilter = [
  '!.git'
, '!node_modules'
, '!coverage'
, '!.nyc_output'
]

const defaultFileFilter = ['*.js']

function Stream() {
  if (!(this instanceof Stream))
    return new Stream()

  Transform.call(this, {
    readableObjectMode: true
  , writableObjectMode: true
  })
}
inherits(Stream, Transform)

Stream.prototype._transform = function _transform(entry, enc, cb) {
  const fullPath = entry.fullPath
  const relativePath = entry.path
  readRequires(fullPath, (err, reqs) => {
    if (err) {
      return this.emit('error', err)
    }

    this.push({
      fullPath: fullPath
    , relativePath: relativePath
    , parentDir: entry.fullParentDir
    , deps: reqs
    })

    cb()
  })
}

function Check(opts) {
  if (!(this instanceof Check))
    return new Check(opts)

  EE.call(this)

  this.opts = Object.assign({
    directoryFilter: defaultDirFilter
  , fileFilter: defaultFileFilter
  , excludes: []
  }, opts)

  if (!this.opts.root) {
    throw new Error('missing required property "root"')
  }

  if (!this.opts.package) {
    this.opts.package = path.join(this.opts.root, 'package.json')
  }

  this.readPackage((err) => {
    if (err) {
      return this.emit('error', err)
    }

    this.stream = readdirp(this.opts)
      .pipe(Stream())
      .on('data', (entry) => {
        this._processEntry(entry)
      })
      .on('error', (err) => {
        this.emit('error', err)
      })
  })
}
inherits(Check, EE)

Check.prototype.readPackage = function readPackage(cb) {
  fs.readFile(this.opts.package, 'utf8', (err, content) => {
    if (err) return cb(err)
    const pkg = tryParseJson(content)
    if (!pkg) {
      const err = new Error('Unable to read package.json')
      return cb(err)
    }

    this.pkg = Object.assign({
      dependencies: {}
    , devDependencies: {}
    }, pkg)
    cb()
  })
}

Check.prototype.pkgJsonHas = function pkgJsonHas(name) {
  const pkg = this.pkg
  return pkg.dependencies.hasOwnProperty(name) ||
    pkg.devDependencies.hasOwnProperty(name)
}

Check.prototype._processEntry = function _processEntry(entry) {
  const fullPath = entry.fullPath
  const relative = entry.relativePath
  const parent = entry.parentDir
  const deps = entry.deps
  const errors = []
  deps.forEach((dep) => {
    if (dep[0] === '.' || dep[0] === '/') {
      // try to require.resolve it
      const resolved = exists(dep, parent)
      if (!resolved) {
        errors.push({
          type: 'local'
        , dependency: dep
        })
      }
    } else {
      if (!internalModules.has(dep) && !this.pkgJsonHas(dep)) {
        errors.push({
          type: 'module'
        , dependency: dep
        })
      }
    }
  })

  setImmediate(() => {
    this.emit('module', {
      fullPath: fullPath
    , relativePath: relative
    , errors: errors
    })
  })
}

function tryParseJson(str) {
  try {
    return JSON.parse(str)
  } catch (_) {
    return undefined
  }
}

function exists(fp, fromDir) {
  try {
    return resolveFrom(fromDir, fp)
  } catch (_) {
    return undefined
  }
}
