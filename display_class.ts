const fs = require("fs");
const csv = require("csv-parser");
const xml2js = require("xml2js");

import { Transaction, Person } from "./models";

import { getLogger } from "log4js";

const logger = getLogger("<filename");

export function displayOne(name: string, support_trans_log: Transaction[]) {
  console.log("LISTING TRANSACTIONS FOR: " + name);
  logger.debug("Listing transactions for " + name);
  for (let j = 0; j < support_trans_log.length; j++) {
    if (support_trans_log[j].From == name || support_trans_log[j].To == name) {
      console.table(support_trans_log[j]);
    }
  }
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
}
