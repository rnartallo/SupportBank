const fs = require('fs')
const csv = require('csv-parser')

type transaction = {
    date: string;
    from: string;
    to: string;
    narrative: string;
    amount: number
}

type transaction_log = transaction[];


let support_trans_log: transaction_log;
