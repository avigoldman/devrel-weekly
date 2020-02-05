const path = require('path')

/**
 * Resolves the given file from the currently active directory
 * @param  {String} file
 * @return {String}     
 */
module.exports = function resolve(file) {
  return path.resolve(process.cwd(), file)
}
