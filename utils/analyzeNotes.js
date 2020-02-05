const _ = require('lodash')
const formatDate = require('date-fns/format')

/**
 * Given an array of notes ({ title, date, tags }), return a table of months and tags, with the number of appearances of each tag per month
 * @param  {Array[Object]} notes
 * @return {Array[Array]
 */
module.exports = function analyzeNotes(notes) {
  /** flatten notes so each note only has one tag */
  const flatNotes = _.flatMap(notes, (note) => {
    return _.map(note.tags, (tag) => ({
      month: formatDate(note.date, 'yyyy-MM'),
      tag
    }))
  })
  /** get the list of months for our rows */
  const listOfMonths = _.sortBy(_.uniq(_.map(flatNotes, 'month')))

  /** sort by month to get the months oldest to newest. The get the unique list of tags where the month is the smallest since it is ordered. Then sort it by the tag so they are alphabetical */
  const listOfTagsWithFirstMonth = _.sortBy(_.uniqBy(_.sortBy(flatNotes, 'month'), 'tag'), 'tag')

  /** generate the table */
  const table = _.map(listOfMonths, (targetMonth) => {
    const monthNotes = _.filter(flatNotes, ({ month }) => month === targetMonth)
    const countsPerTag = _.mapValues(_.groupBy(monthNotes, 'tag'), (tags) => tags.length)
    /** each row has every tag – blank if it hasn't yet occured, or ≥0 if it has */
    const row = _.map(listOfTagsWithFirstMonth, ({ tag, month }) => {
      // if the month we are building the row for is before this tag has appeared, then the cell should be blank
      if (targetMonth < month) {
        return ''
      }

      return _.get(countsPerTag, tag, 0)
    })

    return [ targetMonth, ...row ]
  })

  /** add the header row to the table */
  const results = [
    [ 'month', ..._.map(listOfTagsWithFirstMonth, 'tag') ],
    ...table
  ]

  return results
}