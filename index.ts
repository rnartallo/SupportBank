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
    var names_list: string[] =[]
    for (let i=0;i<support_trans_log.length;i++){
      names_list.push((support_trans_log[i]).From)
      names_list.push(support_trans_log[i].To)
    }
    let unique_names = names_list.filter((e, i) => names_list.indexOf(e) === i);
    console.log(unique_names)
  });




