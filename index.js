#!/usr/bin/env node

const yargs = require('yargs')

yargs
  .command(require('./commands/filter'))
  .command(require('./commands/analyze'))
  .showHelpOnFail(true)
  .demandCommand(1, '')
  .help()
  .argv