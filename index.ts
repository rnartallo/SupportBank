const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");

import * as readline from "readline";
import { Transaction, Person } from "./models";

import { configure, getLogger } from "log4js";
import {
  getFileExt,
  processCSV,
  processJSON,
  processXML,
} from "./file_processor";

import { displayAll, displayOne } from "./display_class";
import { logFaultyCommand, logFaultyTransaction } from "./error_messages";

const logger = getLogger("<filename");

configure({
  appenders: {
    file: { type: "fileSync", filename: "logs/debug.log" },
  },
  categories: {
    default: { appenders: ["file"], level: "debug" },
  },
});

let support_trans_log: Transaction[] = [];
logger.debug("Program starts");
//parsing the csv file into an array of type transaction

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

export function executeMain(support_trans_log: Transaction[], command: string) {
  var names_list: string[] = [];
  for (let i = 0; i < support_trans_log.length; i++) {
    names_list.push(support_trans_log[i].From);
    names_list.push(support_trans_log[i].To);
  }

  let unique_names = names_list.filter((e, i) => names_list.indexOf(e) === i);
  logger.debug("The names of the people are: " + unique_names);
  let account_debits: number[] = new Array(unique_names.length);
  for (let i = 0; i < unique_names.length; ++i) account_debits[i] = 0;
  let account_credits: number[] = new Array(unique_names.length);
  for (let i = 0; i < unique_names.length; ++i) account_credits[i] = 0;

  // now we go through the transactions

  for (let j = 0; j < support_trans_log.length; j++) {
    var send_pos_index = unique_names.indexOf(support_trans_log[j].From);
    var rec_pos_index = unique_names.indexOf(support_trans_log[j].To);
    var value = support_trans_log[j].Amount;
    let faultyTransaction = false;

    if (isNaN(value)) {
      faultyTransaction = true;
      logFaultyTransaction(
        j,
        value,
        unique_names,
        send_pos_index,
        rec_pos_index
      );
      delete support_trans_log[j];
    }

    if (!faultyTransaction) {
      updateAccount(
        account_credits,
        account_debits,
        send_pos_index,
        rec_pos_index,
        value
      );
    }
  }
  logger.debug("Here are the account statuses - without names");
  logger.debug(account_debits);
  logger.debug(account_credits);
  //here we add userinput and query functionality
  if (command == "List All") {
    logger.debug("User has selected list all");
    displayAll(unique_names, account_debits, account_credits);
  } else {
    var name: string = command.substr(5);
    logger.debug("The name is " + name);
    var faultyCommand = false;
    if (!unique_names.includes(name)) {
      faultyCommand = true;
      logFaultyCommand(unique_names);
    }
    if (!faultyCommand) {
      logger.debug("User has selected " + name);
      displayOne(name, support_trans_log);
    }
  }
}

function updateAccount(
  account_credits: number[],
  account_debits: number[],
  send_pos_index: number,
  rec_pos_index: number,
  value: number
) {
  account_debits[send_pos_index] = account_debits[send_pos_index] - value;
  account_credits[rec_pos_index] = account_credits[rec_pos_index] - -value;
}

// function breakdown(
//   unique_names: string[],
//   support_trans_log: Transaction[],
//   name: string
// ) {
//   delete unique_names[unique_names.indexOf(name)];
//   var personal_breakdown: Person[] = [];
// }
