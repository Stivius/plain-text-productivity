import fs from 'fs';
import moment from 'moment';
import {
    FileData,
    ProjectRecord,
    Mark,
    EstimatedProject,
    DATE_REGEX,
    PROJECT_NAME_REGEX,
    METADATA_PROJECT_NAME_REGEX
} from "./interfaces";

enum ParsingState {
    Init = 'init',
    MetadataStarted = 'metadata_started',
    MetadataFinished = 'metadata_finished',
    MetadataActiveProjectsStarted = 'metadata_active_projects_started',
    MetadataActiveProjects = 'metadata_active_projects',
    MetadataCompletedProjects = 'metadata_completed_projects',
    ArchivedProjects = 'archived_projects',
    Record = 'record'
}

type StateAction = (line: string) => void;
type StateTransitionCondition = (line: string) => boolean;

interface Transition {
    newState: ParsingState;
    condition: StateTransitionCondition;
}

class ParsingStateMachine {
    private state = ParsingState.Init;
    private stateActions = new Map<ParsingState, StateAction>();
    private stateTransitions = new Map<ParsingState, Transition[]>();

    addStateAction(state: ParsingState, action: StateAction) {
        this.stateActions.set(state, action);
    }

    addStateTransition(state: ParsingState, newState: ParsingState, condition: StateTransitionCondition) {
        if (!this.stateTransitions.has(state)) {
            this.stateTransitions.set(state, []);
        }
        let transitions = this.stateTransitions.get(state);
        transitions.push({ 
            newState: newState,
            condition: condition
        });
    }

    parseLine(line: string) {
        const transitions = this.stateTransitions.get(this.state);
        if (transitions !== undefined) {
            for (const transition of transitions) {
                if (transition.condition(line)) {
                    this.state = transition.newState;  
                    break;
                }
            }
        }
        this.performActionForState(line);
    }
    
    private performActionForState(line: string) {
        const action = this.stateActions.get(this.state);
        if (action !== undefined) {
            action(line);
        }
    }
}

export class FileParser {
    private projects: string[] = [];
    private records: ProjectRecord[] = [];
    private currentRecord: ProjectRecord = undefined;

    constructor(private filename: string) { }

    parse(): FileData {
        const data = fs.readFileSync(this.filename);
        const lines = data.toString().split('\n');
        const stateMachine = new ParsingStateMachine();

        stateMachine.addStateAction(
            ParsingState.Record,
            (line: string) => {
                if (this.isStartOfNewRecord(line)) {
                    if (this.currentRecord !== undefined) {
                        this.records.push(this.currentRecord);
                    }
                    this.currentRecord = this.createRecord(line);
                } else {
                    this.currentRecord.projects.push(this.parseProject(line));
                }
            }
        );

        stateMachine.addStateAction(
            ParsingState.MetadataActiveProjects,
            (line: string) => {
                this.projects.push(this.parseMetadataProject(line));
            }
        );

        stateMachine.addStateTransition(
            ParsingState.Init,
            ParsingState.MetadataStarted,
            (line: string) => {
                return this.isMetadataSeparator(line);
            }
        );

        stateMachine.addStateTransition(
            ParsingState.Init,
            ParsingState.Record,
            (line: string) => {
                return this.isStartOfNewRecord(line);
            }
        );

        stateMachine.addStateTransition(
            ParsingState.MetadataStarted,
            ParsingState.MetadataActiveProjectsStarted,
            (line: string) => {
                return this.isStartOfActiveProjects(line);
            }
        )

        stateMachine.addStateTransition(
            ParsingState.MetadataActiveProjectsStarted,
            ParsingState.MetadataActiveProjects,
            (line: string) => {
                return true;
            }
        )

        stateMachine.addStateTransition(
            ParsingState.MetadataActiveProjects,
            ParsingState.MetadataFinished,
            (line: string) => {
                return this.isMetadataSeparator(line);
            }
        )

        stateMachine.addStateTransition(
            ParsingState.MetadataFinished,
            ParsingState.Record,
            (line: string) => {
                return this.isStartOfNewRecord(line);
            }
        )

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.length === 0)
                continue;

            stateMachine.parseLine(trimmedLine);
        }
        if (this.currentRecord !== undefined) {
            this.records.push(this.currentRecord);
        }
        return { metadata: { projects: this.projects }, records: this.records };
    }

    private isMetadataSeparator(line: string) {
        return line === '---';
    }

    private isStartOfNewRecord(line: string) {
        return line.match(DATE_REGEX) !== null;
    }

    private isStartOfActiveProjects(line: string) {
        return line.indexOf('Projects:') !== -1;
    }

    private createRecord(line: string): ProjectRecord {
        if (!moment(line, 'YYYY-MM-DD').isValid()) {
            throw Error('invalid date')
        }
        return {
            day: new Date(line),
            projects: [],
        }
    }

    private parseMetadataProject(line: string): string {
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
