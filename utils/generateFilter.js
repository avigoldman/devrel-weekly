const _ = require('lodash')
const isAfter = require('date-fns/isAfter')
const isBefore = require('date-fns/isBefore')
const isEqual = require('date-fns/isEqual')

/**
 * Generates a filter function to filter out all notes that don't match the given filter config
 * 
 * @param  {Date|null}   options.fromDate    
 * @param  {Date|null}   options.toDate      
 * @param  {Array|null}  options.includeTags 
 * @param  {Array|null}  options.excludeTags 
 * @param  {String|null} options.title       
 * @return {Function}                        Filter function 
 */
module.exports = function generateFilter({
  fromDate = null,
  toDate = null,
  includeTags = null,
  excludeTags = null,
  title: titleMatch = null
}) {
  // Normalize the title 
  titleMatch = titleMatch ? normalizeString(titleMatch) : null

  /**
   * Notes filter function 
   * @param  {String} options.title 
   * @param  {Array}  options.tags  
   * @param  {Date}   options.date  
   * @return {Boolean}              "true" if the given note matches the given filters. "false" if not.
   */
  return ({ title, tags, date }) => {
    // fromDate – if we have a fromDate and the note date is before the fromDate, filter it out
    if (!_.isNull(fromDate)) {
      if (isBefore(date, fromDate)) {
        return false
      }
    }

    // toDate – if we have a toDate and the note date is after the toDate, filter it out
    if (!_.isNull(toDate)) {
      if (isAfter(date, toDate)) {
        return false
      }
    }
    
    // includeTags – if we have includeTags and the note doesn't have any includeTags, filter it out
    if (!_.isNull(includeTags)) {
      if (!_.intersection(tags, includeTags).length > 0) {
        return false
      }
    }


    // exludeTags – if we have excludeTags and the note has any exludeTags, filter it out
    if (!_.isNull(excludeTags)) {
      if (_.intersection(tags, excludeTags).length > 0) {
        return false
      }
    }

    // titleMatch – if we have a titleMatch and the note's title doesn't match, filter it out
    if (!_.isNull(titleMatch)) { 
      if (!normalizeString(title).includes(titleMatch)) {
        return false
      }
    }

    return true
  }
}

/**
 * Normalize the given string to better match strings
 * @param  {String} str
 * @return {String}     
 */
function normalizeString(str) {
  return str.toLowerCase()
}