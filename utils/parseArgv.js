const _ = require('lodash')

/**
 * higher order function that validates the argv and passes the cleaned versions to the callback
 * @param  {Function}
 */
module.exports = (fn) => (argv) => {
  if (argv.from && !validateDate(argv.from)) {
    return console.log(`Error: invalidate date "${argv.from}"`)
  } 

  if (argv.to && !validateDate(argv.to)) {
    return console.log(`Error: invalidate date "${argv.to}"`)
  } 

  fn({
    inputFile: argv.file,
    fromDate: argv.from ? new Date(argv.from) : null,
    toDate: new Date(argv.to),
    includeTags: argv.include ? argv.include : null,
    excludeTags: argv.exclude ? argv.exclude : null,
    title: argv.title ? argv.title : null,
    outputFile: argv.output ? argv.output : null,
    outputFormat: argv.format,
    ...argv
  })
}


/**
 * Validates the given string matches a pattern of YYYY-MM-DD
 * @param  {String} date 
 * @return {Boolean}      
 */
function validateDate(date) {
  return /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(date)
}