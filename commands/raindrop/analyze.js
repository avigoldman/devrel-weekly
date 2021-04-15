const fs = require("fs");
const _ = require("lodash");
const formatDate = require("date-fns/format");
const { parse: jsonToCsv } = require("json2csv");
const csvToJson = require("csvtojson");
const ora = require("ora");

const parseArgv = require("../../utils/parseArgv");
const generateFilter = require("../../utils/generateFilter");
const analyzeNotes = require("../../utils/analyzeNotes");
const filterNotesStream = require("../../utils/filterNotesStream");
const resolve = require("../../utils/resolve");

exports.command = "raindrop-analyze [file]";
exports.describe =
  "analyze tag usage grouped by month from raindrop archive data";
exports.builder = require("../evernote/filter").builder;

exports.handler = parseArgv(
  async ({
    inputFile,
    fromDate,
    toDate,
    includeTags,
    excludeTags,
    outputFile,
    outputFormat,
  }) => {
    /** a function to log output if we have an output file – otherwise we don't log to not dirty the output */
    const maybeLog = (msg) =>
      outputFile ? (_.isFunction(msg) ? msg() : console.log(msg)) : null;
    maybeLog(`  - Reading ${inputFile}`);

    const fileContent = fs.readFileSync(resolve(inputFile), "utf8");
    const filter = generateFilter({
      fromDate,
      toDate,
      includeTags,
      excludeTags,
    });

    let spinner = ora("- Filtering rows");
    spinner = maybeLog(() => spinner.start());

    const rows = (await csvToJson().fromString(fileContent)).map((row) => {
      const allTags = _.filter(_.keys(row), (key) => key.startsWith("tag-"));

      return {
        title: row.title,
        tags: _.map(
          _.filter(allTags, (tag) => row[tag] !== ""),
          (tag) => tag.replace(/^tag-/, "")
        ),
        date: new Date(row.date),
        sourceUrl: row.sourceUrl,
      };
    });

    console.log(rows.length);

    const filteredRows = rows.filter(filter);

    console.log(filteredRows.length);

    return;
    spinner = maybeLog(() => spinner.stopAndPersist());

    maybeLog(`  - Analyzing ${filteredRows.length} rows`);
    const table = analyzeNotes(rows);
    const output =
      outputFormat === "csv"
        ? jsonToCsv(table, { header: false })
        : JSON.stringify(table, null, 2);

    if (outputFile) {
      maybeLog(`  - Writing output to ${outputFile}`);
      fs.writeFileSync(resolve(outputFile), output);
    } else {
      process.stdout.write(output);
    }
  }
);
