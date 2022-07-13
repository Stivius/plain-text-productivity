export type Mark = 1|2|3|4|5;

export interface EstimatedProject {
    name: string; // CompoundProject
    mark: Mark;
}

export interface ProjectRecord {
    day: Date;
    projects: EstimatedProject[];	
}

export interface Metadata {
    activeProjects: string[]; // CompoundProject
    acrhivedProjects: string[]; // CompoundProject
}

export interface FileData {
    metadata: Metadata;
    records: ProjectRecord[];
}

export interface ProductivityReportOptions {
    from: Date;
    to: Date;
    absolute: boolean;
    choice: number;
}

export interface ProductivityReportItem {
    name: string;
    productivity: number;
}

export interface ProductivityReport {
    items: ProductivityReportItem[];
    options: ProductivityReportOptions;
}

export const FILE_NAME = 'productivity.txt';
export const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;
export const MARK_REGEX = /^[1-5]$|^-$/;
export const METADATA_PROJECT_NAME_REGEX = /^\-\s*[A-Za-z][A-Za-z0-9_\-\/\.\s]*$/;
export const PROJECT_NAME_REGEX = /^[A-Za-z][A-Za-z0-9_\-\/\.\s]*$/;
