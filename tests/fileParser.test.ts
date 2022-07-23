import { FileParser } from "../src/fileParser";
import fs from "fs";

jest.mock("fs");

const DATA = `
---
Projects:
- First
- Second/Something
- Third
Archived:
- Test/Other/Another
- Test2
---
   
2022-05-22
First:1
Second/Something:2
Third:3
Test/Other/Another:1 

2022-05-23
First:4
Second/Something:5
Third:2
Test/Other/Another:- 
Test2:-

`;

const DATA_ONLY_WITH_METADATA = `
---
Archived:
- Todo.txt Tool
Projects:
- Test Learning
- Non-Fiction Reading
---`;

const DATA_WITH_UNCLOSED_METADATA = `
---
Projects:
- First`;

const DATA_WITHOUT_NEW_LINES = `
---
Projects:
- First
Archived:
- Second
---
2022-05-22
First:1
2022-05-23
First:2`;

const DATA_WITHOUT_METADATA = `
2022-05-22
First:1
Second:2
Third:3
Test:1`;

const UNKNOWN_PROJECT = `
---
Projects:
- First
---
2022-05-22
Second:1

`;

const UNKNOWN_PROJECT_2 = `
---
Archived:
- First
---
2022-05-22
Second:1

`;

const DUPLICATED_METADATA = `
---
Projects:
- First
- First
Archived:
- Second
---
2022-05-22
First:1

`;

const DUPLICATED_METADATA_2 = `
---
Projects:
- First
Archived:
- First
---
2022-05-22
First:1

`;

const DUPLICATED_METADATA_3 = `
---
Projects:
- First
Archived:
- Second
- Second
---
2022-05-22
First:1

`;

const DUPLICATED_RECORD = `
---
Projects:
- First
---
2022-05-22
First:1
First:1

`;

const dataWithInvalidMetadataProject = (project: string) => `
---
Projects:
- First
${project}
--- `;

const dataWithInvalidDate = (date: string) => `
---
Projects:
- First
---
${date}
First:1

`;

const dataWithInvalidMark = (mark: string) => `
---
Projects:
- First
---
2022-05-22
First:${mark}

`;

const dataWithInvalidRecord = (record: string) => `
---
Projects:
- First
---
2022-05-22
${record}

`;

const FILE_NAME = "sample.txt";

describe("fileParser", () => {
  const readFileSyncMocked = fs.readFileSync as jest.Mock;
  let parser: FileParser;

  beforeEach(() => {
    parser = new FileParser(FILE_NAME);
    jest.resetAllMocks();
  });

  test.each([
    DATA,
    DATA_ONLY_WITH_METADATA,
    DATA_WITH_UNCLOSED_METADATA,
    DATA_WITHOUT_NEW_LINES,
  ])("parse valid data", (data: string) => {
    readFileSyncMocked.mockReturnValue(data);

    expect(parser.parse()).toMatchSnapshot();
  });

  test.each([DATA_WITHOUT_METADATA, UNKNOWN_PROJECT, UNKNOWN_PROJECT_2])(
    "parse unknown project",
    (data: string) => {
      readFileSyncMocked.mockReturnValue(data);

      expect(parser.parse.bind(parser)).toThrowError("unknown project");
    }
  );

  test.each([
    DUPLICATED_METADATA,
    DUPLICATED_METADATA_2,
    DUPLICATED_METADATA_3,
  ])("parse duplicated metadata", (data: string) => {
    readFileSyncMocked.mockReturnValue(data);

    expect(parser.parse.bind(parser)).toThrowError(
      "duplicated metadata project"
    );
  });

  test("parse duplicated record", () => {
    readFileSyncMocked.mockReturnValue(DUPLICATED_RECORD);

    expect(parser.parse.bind(parser)).toThrowError("duplicated project record");
  });

  test("parse invalid file", () => {
    readFileSyncMocked.mockReturnValue("dummy");

    expect(parser.parse()).toMatchSnapshot();
  });

  test.each(["2022-99-22", "2022-05-99", "2022-02-30"])(
    "parse invalid date %p",
    (date: string) => {
      readFileSyncMocked.mockReturnValue(dataWithInvalidDate(date));

      expect(parser.parse.bind(parser)).toThrowError("invalid date");
    }
  );

  test.each([
    "dummy",
    "-1",
    "0",
    "6",
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ])("parse invalid mark %p", (mark: string) => {
    readFileSyncMocked.mockReturnValue(dataWithInvalidMark(mark));

    expect(parser.parse.bind(parser)).toThrowError("invalid mark");
  });

  test.each(["dummy", "12345", "- 1abcde", "- test%", "- test&"])(
    "parse invalid metdata project %p",
    (project: string) => {
      readFileSyncMocked.mockReturnValue(
        dataWithInvalidMetadataProject(project)
      );

      expect(parser.parse.bind(parser)).toThrowError(
        "invalid metadata project"
      );
    }
  );

  test.each(["dummy", "1:1", "-t:1", "t%:1", "test^:1"])(
    "parse invalid record %p",
    (record: string) => {
      readFileSyncMocked.mockReturnValue(dataWithInvalidRecord(record));

      expect(parser.parse.bind(parser)).toThrowError();
    }
  );
});
