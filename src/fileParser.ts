import fs from 'fs';
import moment from 'moment';
import {FileData, Record, Mark, Metadata, EstimatedProject, DATE_REGEX, PROJECT_NAME_REGEX, METADATA_PROJECT_NAME_REGEX} from "./interfaces";

enum MetadataParsingState {
    None,
    Started,
    Projects,
    ArchivedProjects
}

enum RecordParsingState {
    None,
    Record,
}

export class FileParser {
    constructor(private filename: string) { }

    parse(): FileData {
        const data = fs.readFileSync(this.filename);
        const lines = data.toString().split('\n');

        const metadata = this.parseMetadata(lines);
        const records = this.parseRecords(lines);

        return { metadata, records };
    }

    // TODO: merge parsing into one method
    private parseMetadata(lines: string[]): Metadata {
        let state: MetadataParsingState = MetadataParsingState.None;
        const METADATA_SEPARATOR = '---';
        const projects: string[] = [];
        let metadataLines = 0;

        for (const line of lines) {
            ++metadataLines;
            if (line === METADATA_SEPARATOR) {
                if (state === MetadataParsingState.None) {
                    state = MetadataParsingState.Started;
                } else {
                    break;
                }
            }
            else if (line.indexOf('Projects:') !== -1) {
                if (state === MetadataParsingState.Started) {
                    state = MetadataParsingState.Projects;
                }
            }
            else if (state === MetadataParsingState.Projects) {
                const trimmedLine = line.trim();
                if (!trimmedLine.match(METADATA_PROJECT_NAME_REGEX)) {
                    throw Error('invalid metadata project');
                }
                const parsedProject = trimmedLine.replace('-', '').trim();
                console.log(projects, projects)
                if (projects.indexOf(parsedProject) !== -1) {
                    throw Error('duplicated metadata project');
                }
                projects.push(parsedProject);
            }
        }

        lines.splice(0, metadataLines);
        return { projects: projects };
    }

    private parseRecords(lines: string[]): Record[] {
        const records: Record[] = [];
        let state = RecordParsingState.None;
        let currentRecord: Record = undefined;

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0) {
                state = RecordParsingState.None;
                if (currentRecord !== undefined) {
                    records.push(currentRecord);
                    currentRecord = undefined;
                }
            }
            else if (trimmedLine.match(DATE_REGEX) && state === RecordParsingState.None) {
                if (!moment(trimmedLine, 'YYYY-MM-DD').isValid()) {
                    throw Error('invalid date')
                }
                state = RecordParsingState.Record;
                currentRecord = {
                    day: new Date(trimmedLine),
                    projects: [],
                }
            }
            else if (state === RecordParsingState.Record) {
                currentRecord.projects.push(this.parseProject(currentRecord, trimmedLine));
            }
        }
        return records;
    }

    private parseProject(currentRecord: Record, line: string): EstimatedProject {
        const splitted = line.split(':');
        const [ name, mark ] = splitted;
        if (splitted.length !== 2 || currentRecord === undefined || !name.match(PROJECT_NAME_REGEX)) {
            throw new Error('invalid record')
        }
        if (currentRecord.projects.find((value) => value.name === name) !== undefined) {
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
