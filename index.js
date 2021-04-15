#!/usr/bin/env node

const yargs = require("yargs");

yargs
  .command(require("./commands/evernote/filter"))
  .command(require("./commands/evernote/analyze"))
  .command(require("./commands/pocket/download"))
  .command(require("./commands/pocket/analyze"))
  .command(require("./commands/raindrop/download"))
  .command(require("./commands/raindrop/analyze"))
  .showHelpOnFail(true)
  .demandCommand(1, "")
  .help().argv;
