const fs = require('fs')
const _ = require('lodash')
const formatDate = require('date-fns/format')
const { parse: jsonToCsv } = require('json2csv')
const parseArgv = require('../utils/parseArgv')
const generateFilter = require('../utils/generateFilter')
const analyzeNotes = require('../utils/analyzeNotes')
const filterNotesStream = require('../utils/filterNotesStream')
const resolve = require('../utils/resolve')
const ora = require('ora')


exports.command = 'filter [file]'
exports.describe = 'filter documents by tag, date, and title'
exports.builder = (yargs) => {
  yargs
    .positional('file', {
      describe: 'Exported enex file',
    })
    .option('f', {
      alias: 'from',
      demandOption: false,
      describe: 'Start date (YYYY-MM-DD)',
      type: 'string'
    })
    .option('t', {
      alias: 'to',
      demandOption: false,
      default: formatDate(new Date(), 'yyyy-MM-dd')  ,
      describe: 'End date (YYYY-MM-DD)',
      type: 'string'
    })
    .option('i', {
      alias: 'include',
      demandOption: false,
      describe: 'Tags to include. All tags are included if not set.',
      type: 'array'
    })
    .option('e', {
      alias: 'exclude',
      demandOption: false,
      describe: 'Tags to exclude',
      type: 'array'
    })
    .option('title', {
      demandOption: false,
      describe: 'Filters notes if title includes the given value. Case-insensitive.',
      type: 'string'
    })
    .option('o', {
      alias: 'output',
      demandOption: false,
      describe: 'Output file',
      type: 'string'
    })
    .option('format', {
      demandOption: false,
      default: 'csv',
      describe: 'Output format',
      choices: [ 'json', 'csv' ]
    })
}
exports.handler = parseArgv(async ({
  inputFile,
  fromDate,
  toDate,
  includeTags,
  excludeTags,
  title,
  outputFile,
  outputFormat,
}) => {
  /** a function to log output if we have an output file – otherwise we don't log to not dirty the output */
  const maybeLog = (msg) => outputFile ? _.isFunction(msg) ? msg() : console.log(msg) : null
  maybeLog(`  - Streaming ${inputFile}`)

  const stream = fs.createReadStream(resolve(inputFile))
  const filter = generateFilter({ fromDate, toDate, includeTags, excludeTags, title })
  
  let spinner = ora('- Filtering notes')
  spinner = maybeLog(() => spinner.start())

  const notes = await filterNotesStream(stream, filter)
  spinner = maybeLog(() => spinner.stopAndPersist())

  const allTags = _.uniq(_.flatMap(notes, 'tags'))
  const notesWithTagColumns = _.map(notes, (note) => {
    // add tags with a prefix to an object that w
    const tagsColumns = _.mapValues(
      _.keyBy(allTags, (tag) => `tag-${tag}`),
      (tag) => note.tags.includes(tag) ? tag : ''
    )

    return {
      ..._.omit(note, ['tags']),
      ...tagsColumns
    }
  })

  console.log(allTags)

  const output = outputFormat === 'csv' ? jsonToCsv(notesWithTagColumns) : JSON.stringify(notes, null, 2)  

  if (outputFile) {
    maybeLog(`  - Writing output to ${outputFile}`)
    fs.writeFileSync(resolve(outputFile), output)
  }
  else {
    process.stdout.write(output)
  }
})