# devrel-weekly CLI

Hey Mary 👋

Here's how to get this set up

## Install

Run the following command:

```sh
npm install -g https://github.com/avigoldman/devrel-weekly.git
```

Now you should be able to use the command line tool.

The following command will write a table to `output.csv` with the tag analysis excluding the "archive tag" for the last quarter in 2019.


```
devrel-weekly analyze my-file.enex --exclude "archive" --from "2019-09-01" --to "2019-12-31" --output "output.csv"
```

Note: Replace `my-file.enex` with the name of the .enex file you've exported from Evernote. Before running the command, make sure to `cd` into the folder where the exported file exists.

WARNING: Be sure to rename your output file before running your next command in order to not overwrite the previous data.

## Commands

There are four commands in the CLI:

* `analyze [enex-file]` - analyze tag usage grouped by month
* `filter [enex-file]` - filter documents by tag, date, and title
* `pocket-download` - download pocket all archive data
* `pocket-analyze [csv-file]` - analyze tag usage grouped by month from pocket archive data

They share the same options:
* `--from` - Start date (YYYY-MM-DD) for when the note was created created 
* `--to` - End date (YYYY-MM-DD) for when the note was created 
  * Default: today
* `--output` – Output file. If not specified the results are written to the console.
* `--include` - Tags to include. All tags are included if not set.
* `--exclude` - Tags to exclude
* `--format` - Format for the output
  * options: `"json"`, `"csv"`
  * default: `"csv"`
* `--title` - Filters notes if title includes the given value. Case-insensitive.

If you are ever not sure what commands or flags are available, run `devrel-weekly --help`


## Using with jq

You can pipe the output to jq by not specifying an output file and setting the format to `"json"`.

##### Example: get the first note found.

```
devrel-weekly filter my-file.enex --exclude "archive" --format "json" | jq '.[0]'
```
