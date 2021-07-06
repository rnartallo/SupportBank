const fs = require('fs')
const csv = require('csv-parser')

class transaction {
    Date: string;
    From: string;
    To: string;
    Narrative: string;
    Amount: number;
    
    constructor(date:string,from:string,to:string,narrative:string,amount:number) { 
        this.Date = date;
        this.From = from;
        this.To = to;
        this.Narrative = narrative;
        this.Amount = amount;
    }
}

let support_trans_log: transaction[] =[];

//parsing the csv file into an array of type transaction
fs.createReadStream('Transactions2014.csv')
  .pipe(csv())
  .on('data', (row: transaction) => support_trans_log.push(row))
  .on('end', () => {



    //we create a 'table' to keep track of the balances
    var names_list: string[] =[]
    for (let i=0;i<support_trans_log.length;i++){
      names_list.push((support_trans_log[i]).From)
      names_list.push(support_trans_log[i].To)
    }
    let unique_names = names_list.filter((e, i) => names_list.indexOf(e) === i);
    let account_totals: number[] = new Array(unique_names.length); for (let i=0; i<unique_names.length; ++i) account_totals[i] = 0;



    // now we go through the transactions

    for(let j=0;j<support_trans_log.length;j++){
        var send_pos_index = unique_names.indexOf(support_trans_log[j].From)
        var rec_pos_index = unique_names.indexOf(support_trans_log[j].To)
        var value = support_trans_log[j].Amount

        account_totals[send_pos_index]=account_totals[send_pos_index]-value
        account_totals[rec_pos_index]=account_totals[rec_pos_index]-(-value)
        console.log(account_totals)
    }
var table = [unique_names, account_totals]
console.log(table)
  });





