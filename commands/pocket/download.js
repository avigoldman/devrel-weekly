const fs = require('fs')
const _ = require('lodash')
const format = require('date-fns/format')
const addMinutes = require('date-fns/addMinutes')
const { parse: jsonToCsv } = require('json2csv')
const parseArgv = require('../../utils/parseArgv')
const resolve = require('../../utils/resolve')
const ora = require('ora')
const axios = require('axios')
const open = require('open');


function formatDate(date, f) {
  return format(addMinutes(date, date.getTimezoneOffset()), f);
}

exports.command = 'pocket download'
exports.describe = 'download pocket all archive data'
exports.builder = (yargs) => {
  yargs
    .option('c', {
      alias: 'consumer-key',
      demandOption: true,
      describe: 'pocket consumer key',
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
  c: consumerKey,
  outputFile,
  outputFormat,
  ...other
}) => {
  const maybeLog = (msg) => outputFile ? _.isFunction(msg) ? msg() : console.log(msg) : null
  maybeLog(`  - Starting pocket authorization`)

  const redirectUri = 'http://localhost:8889'

  const codeResponse = await axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/request`,
    responseType: 'json',
    headers: { 'content-type': 'application/json; charset=UTF-8', 'X-Accept': 'application/json' },
    data: {
      consumer_key: consumerKey,
      redirect_uri: redirectUri
    }
  })

  const code = codeResponse.data.code

  await open(`https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${redirectUri}`)

  await afterAuthorized({ port: 8889 })

  maybeLog(`  - Fetching access token`)

  const authorizeResponse = await axios({
    method: 'post',
    url: `https://getpocket.com/v3/oauth/authorize`,
    responseType: 'json',
    headers: { 'content-type': 'application/json; charset=UTF-8', 'X-Accept': 'application/json' },
    data: {
      consumer_key: consumerKey,
      code: code
    }
  })

  const accessToken = authorizeResponse.data.access_token

  maybeLog(`  - Fetching archived items`)
  
  const listResponse = await axios({
    method: 'post',
    url: `https://getpocket.com/v3/get`,
    responseType: 'json',
    headers: { 'content-type': 'application/json; charset=UTF-8', 'X-Accept': 'application/json' },
    data: {
      consumer_key: consumerKey,
      access_token: accessToken,
      state: 'archive',
      detailType:'complete',
      sort: 'newest'
    }
  })

  const rows = _.map(listResponse.data.list, (row) => {
    return {
      sourceUrl: row.given_url,
      title: row.given_title,
      tags: _.map(row.tags, 'tag'),
      date: formatDate(new Date(row.time_added * 1000), 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'')
    }
  })

  /** Add each tag as it's own column */
  const allTags = _.uniq(_.flatMap(rows, 'tags'))
  const rowsWithTagColumns = _.map(rows, (row) => {
    // add tags with a prefix to an object that w
    const tagsColumns = _.mapValues(
      _.keyBy(allTags, (tag) => `tag-${tag}`),
      (tag) => row.tags.includes(tag) ? tag : ''
    )

    return {
      ..._.omit(row, ['tags']),
      ...tagsColumns
    }
  })

  const output = outputFormat === 'csv' ? jsonToCsv(rowsWithTagColumns) : JSON.stringify(rows, null, 2)  
  
  if (outputFile) {
    maybeLog(`  - Writing output to ${outputFile}`)
    fs.writeFileSync(resolve(outputFile), output)
  }
  else {
    process.stdout.write(output)
  }
})


function afterAuthorized({ port } = { port: 8889 }) {
  return new Promise((resolve) => {
    const express = require('express')
    const app = express()
    let server

    app.get('/', (req, res) => {
      res.send('Complete! Return to the command line.<script>setTimeout(() => window.close(), 5000)</script>')
      server.close()
      resolve()
    })

    server = app.listen(port)
  }) 
}