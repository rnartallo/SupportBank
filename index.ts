const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");

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

function getFileExt(file: string) {
  return file.split(".")[1];
}

function processXML(file: string, command: string) {
  var parser = xml2js.Parser();
  fs.readFile(file, "utf-8", function (error: boolean, text: any) {
    if (error) {
      throw error;
    } else {
      parser.parseString(text, function (err: boolean, result: any) {
        var transactionslist = result["TransactionList"]["SupportTransaction"];
        for (let j = 0; j < transactionslist.length; j++) {
          logger.debug(transactionslist[j]["$"].Date);
          var transaction = new Transaction(
            transactionslist[j]["$"].Date,
            transactionslist[j]["Parties"][0].From[0],
            transactionslist[j]["Parties"][0].To[0],
            transactionslist[j].Description[0],
            transactionslist[j].Value[0]
          );
          support_trans_log.push(transaction);
        }
        logger.debug("The transaction list has been made");
        executeMain(support_trans_log, command);
      });
    }
  });
}

function processJSON(file: string, command: string) {
  const data: string = fs.readFileSync(file, "utf8");
  var raw_data = JSON.parse(data);
  for (let i = 0; i < raw_data.length; i++) {
    var transaction = new Transaction(
      raw_data[i].Date,
      raw_data[i].FromAccount,
      raw_data[i].ToAccount,
      raw_data[i].Narrative,
      raw_data[i].Amount
    );
    support_trans_log.push(transaction);
  }
  logger.debug("Transactions all parsed: beginning further processing");
  executeMain(support_trans_log, command);
}

function processCSV(file: string, command: string) {
  fs.createReadStream(file)
    .pipe(csv())
    .on("data", (row: Transaction) => {
      logger.debug("Handling a transaction:" + row);
      support_trans_log.push(row);
    })
    .on("end", () => {
      //we create a 'table' to keep track of the balances
      logger.debug("Transactions all parsed: beginning further processing");
      executeMain(support_trans_log, command);
    });
}

function executeMain(support_trans_log: Transaction[], command: string) {
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
  logger.debug("Here are the account statuses - without names");
  logger.debug(account_debits);
  logger.debug(account_credits);
  //here we add userinput and query functionality
  if (command == "List All") {
    logger.debug("User has selected list all");
    displayAll(unique_names, account_debits, account_credits);
  } else {
    var name: string = command.substr(5);
    logger.debug("User has selected " + name);
    displayOne(name, support_trans_log);
  }
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
