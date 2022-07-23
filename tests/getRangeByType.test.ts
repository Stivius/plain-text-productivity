import { getRangeByType } from "../src/getRangeByType";

describe("getRangeByType", () => {
  beforeAll(() => {
    jest.useFakeTimers("modern");
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test.each([
    new Date(2022, 6, 1),
    new Date(2022, 6, 5),
    new Date(2022, 6, 30),
  ])("check daily range", (date: Date) => {
    jest.setSystemTime(date);
    expect(getRangeByType(1)).toMatchSnapshot();
  });

  test.each([
    new Date(2022, 4, 30),
    new Date(2022, 4, 31),
    new Date(2022, 5, 1),
    new Date(2022, 5, 2),
    new Date(2022, 5, 3),
    new Date(2022, 5, 4),
    new Date(2022, 5, 5),
    new Date(2022, 5, 6),
  ])("check weekly range", (date: Date) => {
    jest.setSystemTime(date);
    expect(getRangeByType(2)).toMatchSnapshot();
  });

  test.each([
    new Date(2022, 6, 1),
    new Date(2022, 6, 5),
    new Date(2022, 6, 30),
  ])("check monthly range", (date: Date) => {
    jest.setSystemTime(date);
    expect(getRangeByType(3)).toMatchSnapshot();
  });

  test.each([
    new Date(2022, 0, 1),
    new Date(2022, 6, 15),
    new Date(2022, 11, 31),
  ])("check yearly range", (date: Date) => {
    jest.setSystemTime(date);
    expect(getRangeByType(4)).toMatchSnapshot();
  });

  test.each([5, 6, 7, 8, 9, 10])("check n-days range", (type: number) => {
    jest.setSystemTime(new Date(2022, 6, 1));
    expect(getRangeByType(type)).toMatchSnapshot();
  });

  test.each([
    "dummy",
    0,
    -1,
    11,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
  ])("check wrong type", (type: number) => {
    jest.setSystemTime(new Date(2022, 6, 1));
    expect(() => getRangeByType(type)).toThrowError();
  });
});
