const fs = require("fs");
const csv = require("csv-parser");
import * as readline from "readline";
import { Transaction, Person } from "./models";

import { configure, getLogger } from "log4js";

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
  let file_type: String = getFileExt(answer);
  if (file_type == "csv") {
    processCSV(answer);
  }
  rl.close();
});

function getFileExt(file: string) {
  return file.split(".")[1];
}

function processCSV(file: string) {
  fs.createReadStream(file)
    .pipe(csv())
    .on("data", (row: Transaction) => {
      logger.debug("Handling a transaction:" + row);
      support_trans_log.push(row);
    })
    .on("end", () => {
      //we create a 'table' to keep track of the balances
      logger.debug("Transactions all parsed: beginning further processing");
      executeMain(support_trans_log);
    });
}

function executeMain(support_trans_log: Transaction[]) {
  var names_list: string[] = [];
  for (let i = 0; i < support_trans_log.length; i++) {
    names_list.push(support_trans_log[i].From);
    names_list.push(support_trans_log[i].To);
  }
  let unique_names = names_list.filter((e, i) => names_list.indexOf(e) === i);
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
      logger.error(
        "Problem with amount in transaction " +
          j +
          ": the amount is listed as " +
          value
      );
      console.log(
        "There is an error in Transaction " +
          j +
          ". The amount is not a number. It is " +
          value +
          " This entry has been emitted"
      );
      console.log(
        "The affected parties are: " +
          unique_names[send_pos_index] +
          " and " +
          unique_names[rec_pos_index]
      );
      delete support_trans_log[j];
      logger.debug(
        "Transaction " + j + " has been removed and the user has been alerted"
      );
    }

    if (!faultyTransaction) {
      account_debits[send_pos_index] = account_debits[send_pos_index] - value;
      account_credits[rec_pos_index] = account_credits[rec_pos_index] - -value;
    }
  }
  //here we add userinput and query functionality
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter a command: ", (answer) => {
    if (answer == "List All") {
      displayAll(unique_names, account_debits, account_credits);
    } else {
      var name: string = answer.substr(5);
      displayOne(name, support_trans_log);
    }
    rl.close();
  });
}

function displayOne(name: string, support_trans_log: Transaction[]) {
  console.log("LISTING TRANSACTIONS FOR: " + name);
  logger.debug("Listing transactions for " + name);
  for (let j = 0; j < support_trans_log.length; j++) {
    if (support_trans_log[j].From == name || support_trans_log[j].To == name) {
      console.table(support_trans_log[j]);
    }
  }
}

function displayAll(
  unique_names: string[],
  account_debits: number[],
  account_credits: number[]
) {
  console.log("Listing all transactions");
  logger.debug("Listing all transactions");
  let table: Person[] = [];
  for (let j = 0; j < unique_names.length; j++) {
    var entry = new Person(
      unique_names[j],
      -account_debits[j].toFixed(2),
      Number(account_credits[j].toFixed(2))
    );
    table.push(entry);
  }
  console.table(table);
}
