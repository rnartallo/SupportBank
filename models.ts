export class Transaction {
  Date: Date;
  From: string;
  To: string;
  Narrative: string;
  Amount: number;

  constructor(
    date: Date,
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

export class Person {
  Name: string;
  Owe: number;
  Owed: number;

  constructor(Name: string, Owe: number, Owed: number) {
    this.Name = Name;
    this.Owe = Owe;
    this.Owed = Owed;
  }
}
