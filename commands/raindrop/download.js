const fs = require("fs");
const _ = require("lodash");
const format = require("date-fns/format");
const addMinutes = require("date-fns/addMinutes");
const { parse: jsonToCsv } = require("json2csv");
const parseArgv = require("../../utils/parseArgv");
const resolve = require("../../utils/resolve");
const ora = require("ora");
const axios = require("axios");
const open = require("open");

function formatDateUTC(date, f) {
  return format(addMinutes(date, date.getTimezoneOffset()), f);
}

exports.command = "raindrop-download";
exports.describe = "download raindrop all archive data";
exports.builder = (yargs) => {
  yargs
    .option("t", {
      alias: "test-token",
      demandOption: true,
      describe: "raindrop test key",
      type: "string",
    })
    .option("o", {
      alias: "output",
      demandOption: false,
      describe: "Output file",
      type: "string",
    })
    .option("format", {
      demandOption: false,
      default: "csv",
      describe: "Output format",
      choices: ["json", "csv"],
    });
};
exports.handler = parseArgv(
  async ({ t: testToken, outputFile, outputFormat, ...other }) => {
    const maybeLog = (msg) =>
      outputFile ? (_.isFunction(msg) ? msg() : console.log(msg)) : null;

    maybeLog(`  - Fetching items`);

    const items = await downloadAllItems({ testToken, maybeLog });

    maybeLog(`  - ${items.length} items found`);

    const rows = _.map(items, (row) => {
      return {
        sourceUrl: row.link,
        title: row.title,
        tags: row.tags,
        date: formatDateUTC(
          new Date(row.created),
          "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ),
      };
    });

    /** Add each tag as it's own column */
    const allTags = _.uniq(_.flatMap(rows, "tags"));
    const rowsWithTagColumns = _.map(rows, (row) => {
      // add tags with a prefix to an object that w
      const tagsColumns = _.mapValues(
        _.keyBy(allTags, (tag) => `tag-${tag}`),
        (tag) => (row.tags.includes(tag) ? tag : "")
      );

      return {
        ..._.omit(row, ["tags"]),
        ...tagsColumns,
      };
    });

    const output =
      outputFormat === "csv"
        ? jsonToCsv(rowsWithTagColumns)
        : JSON.stringify(rows, null, 2);

    if (outputFile) {
      maybeLog(`  - Writing output to ${outputFile}`);
      fs.writeFileSync(resolve(outputFile), output);
    } else {
      process.stdout.write(output);
    }
  }
);

async function downloadAllItems({ testToken, maybeLog, page = 0 }) {
  maybeLog(`  - Fetching page ${page}`);

  const response = await axios({
    method: "get",
    url: `https://api.raindrop.io/rest/v1/raindrops/0?perpage=50&page=${page}`,
    responseType: "json",
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "X-Accept": "application/json",
      Authorization: `Bearer ${testToken}`,
    },
  });

  const items = response.data.items;

  if (items.length === 0) {
    maybeLog(`  - Completed fetching`);
    return items;
  }

  if (_.get(response.headers, "x-ratelimit-remaining", 1) === 0) {
    maybeLog(`  - Rate limited: sleeping for 60 seconds`);
    await sleep(60000);
  } else {
    await sleep(200);
  }

  return [
    ...items,
    ...(await downloadAllItems({ testToken, maybeLog, page: page + 1 })),
  ];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
