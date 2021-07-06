const fs = require('fs')
const csv = require('csv-parser')

type transaction = {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: number
}

var support_trans_log: transaction[] =[];


fs.createReadStream('Transactions2014.csv')
  .pipe(csv())
  .on('data', (row: transaction) => support_trans_log.push(row))
  .on('end', () => {
    console.log(support_trans_log);
  });