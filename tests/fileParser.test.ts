import {FileParser} from '../src/fileParser'
import fs from 'fs'

jest.mock('fs')

const DATA = `
---
Projects:
- First
- Second
- Third
---
   
2022-05-22
First:1
Second:2
Third:3
Test:1 

2022-05-23
First:4
Second:5
Third:2
Test:- 
Test2:-

`;

// FIXME record should be parsed
const DATA_WITHOUT_METADATA = `
2022-05-22
First:1
Second:2
Third:3
Test:1`;

const DATA_ONLY_WITH_METADATA = `
---
Projects:
- First
- a1234
-abcd
---`;

const DATA_WITH_UNCLOSED_METADATA = `
---
Projects:
- First`;

// FIXME 2 records should be parsed
const DATA_WITHOUT_NEW_LINES = `
---
Projects:
- First
---
2022-05-22
First:1
2022-05-23
First:2`;

const DUPLICATED_METADATA = `
---
Projects:
- First
- First
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

const dataWithInvalidProject = (project: string) => `
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

const FILE_NAME = 'sample.txt';

describe('fileParser', () => {
    const readFileSyncMocked = fs.readFileSync as jest.Mock;
    const parser = new FileParser(FILE_NAME);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each([
        DATA,
        DATA_WITHOUT_METADATA,
        DATA_ONLY_WITH_METADATA,
        DATA_WITH_UNCLOSED_METADATA,
        DATA_WITHOUT_NEW_LINES
    ])('parse valid data', (data: string) => {
        readFileSyncMocked.mockReturnValue(data);

        expect(parser.parse()).toMatchSnapshot();
    });

    test.each([
        DUPLICATED_METADATA,
        DUPLICATED_RECORD,
    ])('parse duplicated data', (data: string) => {
        readFileSyncMocked.mockReturnValue(data);

        expect(parser.parse.bind(parser)).toThrowError();
    });

    test('parse invalid file', () => {
        readFileSyncMocked.mockReturnValue('dummy');

        expect(parser.parse()).toMatchSnapshot();
    });

    // FIXME: throw exception
    test.each([
        '2022/05/22',
        '2022-99-22',
        '9999-05-22',
        '2022-05-99',
        '2022-02-30',
    ])('parse invalid date %p', (date: string) => {
        readFileSyncMocked.mockReturnValue(dataWithInvalidDate(date));

        expect(parser.parse.bind(parser)).toThrowError();
    });

    test.each([
        'dummy',
        '-1',
        '0',
        '6',
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
    ])('parse invalid mark %p', (mark: string) => {
        readFileSyncMocked.mockReturnValue(dataWithInvalidMark(mark));

        expect(parser.parse.bind(parser)).toThrowError();
    });

    // FIXME exception for invalid project
    test.each([
        'dummy',
        '12345',
        '- 1abcde',
        '- test/',
    ])('parse invalid project %p', (project: string) => {
        readFileSyncMocked.mockReturnValue(dataWithInvalidProject(project));

        expect(parser.parse.bind(parser)).toThrowError();
    });

    // FIXME exception for invalid project name
    test.each([
        'dummy',
        '1:1',
        '-t:1',
        't-:1',
        'test/:1',
    ])('parse invalid record %p', (record: string) => {
        readFileSyncMocked.mockReturnValue(dataWithInvalidRecord(record));

        expect(parser.parse.bind(parser)).toThrowError();
    });
});
