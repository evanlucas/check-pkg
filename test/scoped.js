'use strict'

const tap = require('tap')

if (require.main === module) {
  tap.pass('skip')
  return
}

require('@helpdotcom/biscuits')
require('@helpdotcom/biscuits/thing')
require('@helpdotcom/biscuit/thing')
require('@helpdotcom/biscuits2')
