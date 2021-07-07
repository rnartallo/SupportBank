const fs = require("fs");
const csv = require("csv-parser");
import * as readline from "readline";

class transaction {
  Date: string;
  From: string;
  To: string;
  Narrative: string;
  Amount: number;

  constructor(
    date: string,
    from: string,
    to: string,
    narrative: string,
    amount: number
  ) {
    this.Date = date;
    this.From = from;
    this.To = to;
    this.Narrative = narrative;
    this.Amount = amount;
  }
}

class person {
  Name: string;
  Owe: number;
  Owed: number;

  constructor(Name: string, Owe: number, Owed: number) {
    this.Name = Name;
    this.Owe = Owe;
    this.Owed = Owed;
  }
}

let support_trans_log: transaction[] = [];

//parsing the csv file into an array of type transaction
fs.createReadStream("Transactions2014.csv")
  .pipe(csv())
  .on("data", (row: transaction) => support_trans_log.push(row))
  .on("end", () => {
    //we create a 'table' to keep track of the balances
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
        displayAll();
      } else {
        var name: string = answer.substr(5);
        displayOne(name);
      }
      rl.close();

      function displayAll() {
        let table: person[] = [];

        for (let j = 0; j < unique_names.length; j++) {
          var entry = new person(
            unique_names[j],
            -account_debits[j].toFixed(2),
            Number(account_credits[j].toFixed(2))
          );
          table.push(entry);
        }
        console.table(table);
      }

      function displayOne(name: string) {
        for (let j = 0; j < support_trans_log.length; j++) {
          if (
            support_trans_log[j].From == name ||
            support_trans_log[j].To == name
          ) {
            console.table(support_trans_log[j]);
          }
        }
      }
    });
  });
