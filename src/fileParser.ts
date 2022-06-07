import fs from 'fs';
import {FileData, Record, Mark, Metadata, EstimatedProject, DATE_REGEX} from "./interfaces";

enum MetadataParsingState {
    None,
    Started,
    Projects
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
                const projectName = line.replace('-','').trim();
                projects.push(projectName);
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
        if (splitted.length !== 2 || currentRecord === undefined) {
            throw new Error('Error while parsing line')
        }
    return {
        name: splitted[0],
        mark: this.parseMark(splitted[1]),
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
            throw new Error('Error while parsing mark')
        }
    return mark as Mark;
    }
}
