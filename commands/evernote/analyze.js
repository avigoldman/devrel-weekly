const fs = require("fs");
const _ = require("lodash");
const formatDate = require("date-fns/format");
const { parse: jsonToCsv } = require("json2csv");
const ora = require("ora");

const parseArgv = require("../../utils/parseArgv");
const generateFilter = require("../../utils/generateFilter");
const analyzeNotes = require("../../utils/analyzeNotes");
const filterNotesStream = require("../../utils/filterNotesStream");
const resolve = require("../../utils/resolve");

exports.command = "evernote-analyze [file]";
exports.describe = "analyze tag usage grouped by month from evernote export";
exports.builder = require("./filter").builder; // same options

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
    maybeLog(`  - Streaming ${inputFile}`);

    const stream = fs.createReadStream(resolve(inputFile));
    const filter = generateFilter({
      fromDate,
      toDate,
      includeTags,
      excludeTags,
    });

    let spinner = ora("- Filtering notes");
    spinner = maybeLog(() => spinner.start());

    const notes = await filterNotesStream(stream, filter);
    spinner = maybeLog(() => spinner.stopAndPersist());

    maybeLog(`  - Analyzing ${notes.length} notes`);
    const table = analyzeNotes(notes);
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
