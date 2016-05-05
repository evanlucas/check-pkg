#!/usr/bin/env node

'use strict'

const help = require('help')()
const nopt = require('nopt')
const chalk = require('chalk')
const knownOpts = { help: Boolean
                  , version: Boolean
                  , verbose: Boolean
                  , 'file-filter': [String]
                  , 'dir-filter': [String]
                  , excludes: [String]
                  }
const shortHand = { h: ['--help']
                  , v: ['--version']
                  , f: ['--file-filter']
                  , d: ['--dir-filter']
                  , e: ['--excludes']
                  }
const parsed = nopt(knownOpts, shortHand)
const X = chalk.red('✖')
const CHECK = chalk.green('✔')

if (parsed.help) {
  return help()
}

if (parsed.version) {
  console.log('check-pkg', `v${require('../package').version}`)
  return
}

const opts = {
  root: process.cwd()
}

if (parsed['file-filter']) {
  opts.fileFilter = parsed['file-filter']
}

if (parsed['dir-filter']) {
  opts.directoryFilter = parsed['dir-filter']
}

if (parsed.excludes && parsed.excludes.length) {
  opts.excludes = parsed.excludes
}

const checker = require('../')(opts)
checker.on('module', print)
checker.on('error', printError)

function printError(err) {
  process.exitCode = 1
  console.log(chalk.red('ERR!'), err)
}

function print(mod) {
  if (mod.errors && mod.errors.length) {
    fail(1)
    console.log('  %s %s', X, chalk.underline(mod.relativePath))
  } else {
    if (parsed.verbose)
      console.log('  %s %s', CHECK, chalk.underline(mod.relativePath))
  }

  if (mod.errors && mod.errors.length) {
    mod.errors.forEach((e) => {
      missing(e.dependency)
    })
  }
}

function fail(code) {
  if (!process.exitCode) process.exitCode = code
}

function missing(name) {
  console.log('    %s %s', chalk.grey('- missing'), chalk.red(name))
}
