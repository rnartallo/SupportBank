import { getLogger } from "log4js";
import { Transaction } from "./models";
let support_trans_log: Transaction[] = [];

const logger = getLogger("<filename");
export function logFaultyCommand(unique_names: string[]) {
  logger.error("User has entered invalid command");
  console.log("That is not a valid command");
  console.log("You can either 'List All' or you can 'List + [name]'");
  console.log("The possible names are " + unique_names);
}

export function logFaultyTransaction(
  j: number,
  value: number,
  unique_names: string[],
  send_pos_index: number,
  rec_pos_index: number
) {
  logger.error(
    "Problem with amount in transaction " +
      j +
      ": the amount is listed as " +
      value
  );
  console.log(
    "There is an error in Transaction " +
      j +
      ". The amount is not a number. It is " +
      value +
      " This entry has been emitted"
  );
  console.log(
    "The affected parties are: " +
      unique_names[send_pos_index] +
      " and " +
      unique_names[rec_pos_index]
  );
  delete support_trans_log[j];
  logger.debug(
    "Transaction " + j + " has been removed and the user has been alerted"
  );
}
