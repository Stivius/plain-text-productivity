export type Mark = 1|2|3|4|5;

export interface EstimatedProject {
	name: string;
	mark: Mark;
}

export interface Record {
	day: Date;
	projects: EstimatedProject[];	
}

export interface Metadata {
	projects: string[];
}

export interface FileData {
	metadata: Metadata;
	records: Record[];
}

export const FILE_NAME = 'productivity.txt';
export const DATE_REGEX = /\d{4}-\d{2}-\d{2}/;
export const MARK_REGEX = /^[1-5]$|^-$/;
