import fs from 'fs';
import moment from 'moment';
import {
    FileData,
    Record,
    Mark,
    EstimatedProject,
    DATE_REGEX,
    PROJECT_NAME_REGEX,
    METADATA_PROJECT_NAME_REGEX
} from "./interfaces";

enum ParsingState {
    Init,
    MetadataStarted,
    MetadataActiveProjects,
    ArchivedProjects,
    Blank,
    Record,
}

export class FileParser {
    private projects: string[] = [];
    private records: Record[] = [];
    private currentRecord: Record = undefined;

    constructor(private filename: string) { }

    parse(): FileData {
        const data = fs.readFileSync(this.filename);
        const lines = data.toString().split('\n');

        const METADATA_SEPARATOR = '---';

        let state: ParsingState = ParsingState.Init;
        let metadataLines = 0;

        for (const line of lines) {
            const trimmedLine = line.trim();
            ++metadataLines;
            switch (state) {
                case ParsingState.Init:
                    if (trimmedLine === METADATA_SEPARATOR) {
                        state = ParsingState.MetadataStarted;
                    }
                    break;
                case ParsingState.MetadataStarted:
                    if (trimmedLine.indexOf('Projects:') !== -1) {
                        state = ParsingState.MetadataActiveProjects;
                    }                     break;
                case ParsingState.MetadataActiveProjects:
                    if (trimmedLine === METADATA_SEPARATOR) {
                        state = ParsingState.Blank;
                    } else {
                        this.projects.push(this.parseMetadataProject(trimmedLine));
                    }
                    break;
                case ParsingState.Blank:
                    if (trimmedLine.match(DATE_REGEX)) {
                        state = ParsingState.Record;
                        this.currentRecord = this.createRecord(trimmedLine);
                    }
                    break;
                case ParsingState.Record:
                    if (trimmedLine.length !== 0) {
                        this.currentRecord.projects.push(this.parseProject(trimmedLine));
                    } else {
                        state = ParsingState.Blank;
                        if (this.currentRecord !== undefined) {
                            this.records.push(this.currentRecord);
                            this.currentRecord = undefined;
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return { metadata: { projects: this.projects }, records: this.records };
    }

    private createRecord(line: string) {
        if (!moment(line, 'YYYY-MM-DD').isValid()) {
            throw Error('invalid date')
        }
        return {
            day: new Date(line),
            projects: [],
        }
    }

    private parseMetadataProject(line: string) {
        if (!line.match(METADATA_PROJECT_NAME_REGEX)) {
            throw Error('invalid metadata project');
        }
        const parsedProject = line.replace('-', '').trim();
        if (this.projects.indexOf(parsedProject) !== -1) {
            throw Error('duplicated metadata project');
        }
        return parsedProject;
    }

    private parseProject(line: string): EstimatedProject {
        const splitted = line.split(':');
        const [ name, mark ] = splitted;
        if (splitted.length !== 2 || this.currentRecord === undefined || !name.match(PROJECT_NAME_REGEX)) {
            throw new Error('invalid record')
        }
        if (this.currentRecord.projects.find((value) => value.name === name) !== undefined) {
            throw new Error('duplicated project record')
        }
        return {
            name: splitted[0],
            mark: this.parseMark(mark),
        };
    }

    private parseMark(value: string): Mark {
        // TODO: mark regex validate
        const trimmedValue = value.trim();
        if (trimmedValue === '-') {
            return undefined;
        }
        const mark = parseInt(value);
        if (Number.isNaN(mark) || mark < 1 || mark > 5) {
            throw new Error('invalid mark')
        }
        return mark as Mark;
    }
}
