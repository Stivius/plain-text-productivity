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
            // TODO: state machine
            if (trimmedLine === METADATA_SEPARATOR) {
                if (state === ParsingState.Init) {
                    state = ParsingState.MetadataStarted;
                } else {
                    state = ParsingState.Blank;
                }
            }
            else if (trimmedLine.indexOf('Projects:') !== -1) {
                if (state === ParsingState.MetadataStarted) {
                    state = ParsingState.MetadataActiveProjects;
                }
            }
            else if (state === ParsingState.MetadataActiveProjects) {
                this.projects.push(this.parseMetadataProject(trimmedLine));
            }
            else if (trimmedLine.length === 0 && state !== ParsingState.Init) {
                state = ParsingState.Blank;
                if (this.currentRecord !== undefined) {
                    this.records.push(this.currentRecord);
                    this.currentRecord = undefined;
                }
            }
            else if (trimmedLine.match(DATE_REGEX) && state === ParsingState.Blank) {
                state = ParsingState.Record;
                this.currentRecord = this.createRecord(trimmedLine);
            }
            else if (state === ParsingState.Record) {
                this.currentRecord.projects.push(this.parseProject(trimmedLine));
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
