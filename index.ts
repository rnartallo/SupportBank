const fs = require("fs");
const csv = require("csv-parser");
import * as readline from "readline";
import { Transaction, Person } from "./models";

let support_trans_log: Transaction[] = [];

//parsing the csv file into an array of type transaction
fs.createReadStream("Transactions2014.csv")
  .pipe(csv())
  .on("data", (row: Transaction) => support_trans_log.push(row))
  .on("end", () => {
    //we create a 'table' to keep track of the balances
    executeMain(support_trans_log);
  });

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

    account_debits[send_pos_index] = account_debits[send_pos_index] - value;
    account_credits[rec_pos_index] = account_credits[rec_pos_index] - -value;
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
      console.log("LISTING TRANSACTIONS FOR: " + name);
      displayOne(name, support_trans_log);
    }
    rl.close();
  });
}

function displayOne(name: string, support_trans_log: Transaction[]) {
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
