const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");
let support_trans_log: Transaction[] = [];

import { Transaction } from "./models";
import { executeMain } from "./accounting_file";

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

export function getFileExt(file: string) {
  return file.split(".")[1];
}

export function processXML(file: string, command: string) {
  logger.debug("File is XML");
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

export function processJSON(file: string, command: string) {
  logger.debug("File is JSON");
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

export function processCSV(file: string, command: string) {
  logger.debug("File is CSV");
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
