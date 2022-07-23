import chalk from "chalk";
import columnify from "columnify";
import dateFormat from "dateformat";
import prompt from "prompt";

function formatDate(date: Date) {
  return dateFormat(date, "yyyy-mm-dd");
}

export function formatInputForFile(date: Date, data: prompt.Properties) {
  return `${formatDate(date)}\n`
    .concat(
      Object.keys(data)
        .map((k) => {
          return `${k}:${data[k]}`;
        })
        .join("\n")
    )
    .concat("\n\n");
}

export function formatInputForConsole(
  date: Date,
  data: prompt.Properties
): string {
  const colorizeMark = (value: string) => {
    switch (value) {
      case "1":
        return chalk.rgb(150, 0, 0).bold(value);
      case "2":
        return chalk.rgb(255, 125, 125).bold(value);
      case "3":
        return chalk.rgb(255, 255, 75).bold(value);
      case "4":
        return chalk.rgb(125, 255, 125).bold(value);
      case "5":
        return chalk.rgb(0, 180, 0).bold(value);
    }
    return chalk.white(value);
  };

  return `${chalk.blue(formatDate(date))}\n`.concat(
    columnify(
      Object.keys(data).map((k) => ({
        project: chalk.yellow(k),
        mark: colorizeMark(data[k] as string),
      }))
    )
  );
}
