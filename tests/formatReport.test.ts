import { formatReport } from "../src/formatReport";
import {
  ProductivityReportItem,
  ProductivityReportOptions,
} from "../src/interfaces";

function reportOptions(options: {
  absolute?: boolean;
  choice?: number;
}): ProductivityReportOptions {
  return {
    from: new Date("2022-07-01"),
    to: new Date("2022-07-04"),
    absolute: options.absolute === undefined ? true : options.absolute,
    choice: options.choice || 0,
  };
}

const REPORT_ITEMS: ProductivityReportItem[] = [
  { name: "zero", productivity: 0 },
  { name: "first", productivity: 0.1 },
  { name: "second", productivity: 0.2 },
  { name: "third", productivity: 0.3 },
  { name: "fourth", productivity: 0.4 },
  { name: "fifth", productivity: 0.5 },
  { name: "sixth", productivity: 0.6 },
  { name: "seventh", productivity: 0.7 },
  { name: "eight", productivity: 0.8 },
  { name: "ninth", productivity: 0.9 },
  { name: "tenth", productivity: 1 },
];

describe("formatReport", () => {
  test.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    "report with all choices",
    (choice: number) => {
      expect(
        formatReport({
          items: REPORT_ITEMS,
          options: reportOptions({ choice: choice }),
        })
      ).toMatchSnapshot();
    }
  );

  test.each([false, true])("report relativeness", (absolute: boolean) => {
    expect(
      formatReport({
        items: REPORT_ITEMS,
        options: reportOptions({ absolute: absolute }),
      })
    ).toMatchSnapshot();
  });
});
