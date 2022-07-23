import { formatInputForFile, formatInputForConsole } from "../src/formatInput";

const DATA_SAMPLE = {
  Key1: "Value1",
  Key2: "Value2",
  Key3: "Value3",
};

describe("formatInput", () => {
  const date = new Date("2022-01-01");

  test("formatInputForFile", () => {
    expect(formatInputForFile(date, DATA_SAMPLE)).toMatchSnapshot();
  });

  test("formatInputForConsole", () => {
    expect(formatInputForConsole(date, DATA_SAMPLE)).toMatchSnapshot();
  });
});
