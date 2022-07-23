import chalk from "chalk";
import prompt from "prompt";
import { getRangeByType } from "./getRangeByType";
import { readRangeDateFromConsole } from "./readRangeDatesFromInput";

export async function readRangeChoiceFromConsole() {
  console.log("Choose pre-defined range or enter custom:");
  console.log(`${chalk.blue("0")}:custom report`);
  console.log(`${chalk.blue("1")}:daily report`);
  console.log(`${chalk.blue("2")}:weekly report`);
  console.log(`${chalk.blue("3")}:monthly report`);
  console.log(`${chalk.blue("4")}:yearly report`);
  console.log(`${chalk.blue("5")}:7-days report`);
  console.log(`${chalk.blue("6")}:14-days report`);
  console.log(`${chalk.blue("7")}:30-days report`);
  console.log(`${chalk.blue("8")}:90-days report`);
  console.log(`${chalk.blue("9")}:180-days report`);
  console.log(`${chalk.blue("10")}:365-days report`);
  prompt.start();
  const schema = {
    properties: {
      choice: {
        pattern: /^[0-9]{1,2}$/,
        required: true,
      },
    },
  };

  const { choice } = await prompt.get(schema);

  if (choice === "0") {
    const { from, to } = await readRangeDateFromConsole();
    return { from, to, choice: 0 };
  }

  return getRangeByType(choice as number);
}
