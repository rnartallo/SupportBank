const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");

import * as readline from "readline";
import { Transaction } from "./models";

import { configure, getLogger } from "log4js";
import {
  getFileExt,
  processCSV,
  processJSON,
  processXML,
} from "./file_processor";

const logger = getLogger("<filename");

configure({
  appenders: {
    file: { type: "fileSync", filename: "logs/debug.log" },
  },
  categories: {
    default: { appenders: ["file"], level: "debug" },
  },
});

logger.debug("Program starts");

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter a filename: ", (answer) => {
  rl.question("Enter a command: ", function (command) {
    let file_type: String = getFileExt(answer);
    if (file_type == "csv") {
      processCSV(answer, command);
    } else if (file_type == "json") {
      processJSON(answer, command);
    } else if (file_type == "xml") {
      processXML(answer, command);
    }
    rl.close();
  });
});
