export type Mark = 1|2|3|4|5;

export interface EstimatedProject {
    name: string;
    mark: Mark;
}

export interface ProjectRecord {
    day: Date;
    projects: EstimatedProject[];	
}

export interface Metadata {
    projects: string[];
}

export interface FileData {
    metadata: Metadata;
    records: ProjectRecord[];
}

export const FILE_NAME = 'productivity.txt';
export const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;
export const MARK_REGEX = /^[1-5]$|^-$/;
export const METADATA_PROJECT_NAME_REGEX = /^\-\s*[A-Za-z][A-Za-z0-9_\-\/]*$/;
export const PROJECT_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_\-\/]*$/;
