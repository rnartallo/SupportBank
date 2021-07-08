const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");

import { Transaction, Person } from "./models";

import { getLogger } from "log4js";

const logger = getLogger("<filename");

export function displayOne(name: string, support_trans_log: Transaction[]) {
  console.log("LISTING TRANSACTIONS FOR: " + name);
  logger.debug("Listing transactions for " + name);
  let table: Transaction[] = [];
  for (let j = 0; j < support_trans_log.length; j++) {
    if (support_trans_log[j].From == name || support_trans_log[j].To == name) {
      table.push(support_trans_log[j]);
    }
  }
  console.table(table);
}

export function displayAll(
  unique_names: string[],
  account_debits: number[],
  account_credits: number[]
) {
  console.log("Listing all people");
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
  writeOutputToFileAll(table);
}

function writeOutputToFileAll(table: any) {
  outputefile.write("Name " + "\t" + "Owe" + "\t" + "Owed" + "\n");
  for (let i = 0; i < table.length; i++) {
    outputefile.write(
      table[i].Name + "\t" + table[i].Owe + "\t" + table[i].Owed + "\n"
    );
  }
}
