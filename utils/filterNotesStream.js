const flow = require('xml-flow')
const striptags = require('striptags')
const _ = require('lodash')

/**
 * Takes a stream and filters the stream to notes ({ title, tags, date, sourceUrl }) if they match the given filter function
 * @param  {Stream}         stream
 * @param  {Function}       filter
 * @return {Promise<Array>}       
 */
module.exports = function filterNotesStream(stream, filter) {
  return new Promise((resolve, reject) => {
    const xmlStream = flow(stream)
    
    let filteredArray = []
    xmlStream.on('tag:note', function(rawNote) {
      const note = {
        title: striptags(rawNote.title),
        tags: _.castArray(rawNote.tag),
        date: parseEnexDate(rawNote.created),
        sourceUrl: _.get(rawNote, ['note-attributes', 'source-url'], '')
      }

      if (filter(note)) {
        filteredArray.push(note)
      }
    })

    xmlStream.on('end', () => resolve(filteredArray))
    xmlStream.on('error', reject)
  })
}

/**
 * Parse a string date from the YYYYMMDDTHHMMSSZ format
 * @param  {String} date
 * @return {[Date}
 */
function parseEnexDate(date) {
  date = date.split('')
  date.splice(13, 0, ':')
  date.splice(11, 0, ':')
  date.splice(6, 0, '-')
  date.splice(4, 0, '-')
  date = date.join('')

  return new Date(date)
}