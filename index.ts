import commandLineArgs from 'command-line-args';
import fs from 'fs';
import prompt from 'prompt';
import dateFormat from 'dateformat'
import chalk from 'chalk';
import chain, {filter, sumBy} from 'lodash'
import columnify from 'columnify'

const commandsDefinitions = [
  { name: 'command', defaultOption: true },
]

const commands = commandLineArgs(commandsDefinitions, { stopAtFirstUnknown: true });

type Mark = 1|2|3|4|5;

interface EstimatedProject {
	name: string;
	mark: Mark;
}

interface Record {
	day: Date;
	projects: EstimatedProject[];	
}

interface Metadata {
	projects: string[];
}

interface FileData {
	metadata: Metadata;
	records: Record[];
}

const FILE_NAME = 'productivity.txt';

enum MetadataParsingState {
	None,
	Started,
	Projects
}

// TODO: refactor
function parseMetadata(lines: string[]): Metadata {
	let state: MetadataParsingState = MetadataParsingState.None;
	const projects: string[] = [];
	let metadataLines = 0;
	for (const line of lines) {
		++metadataLines;
		if (line === '---') {
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

enum RecordParsingState {
	None,
	Record,
}

// TODO: refactor
function parseRecords(lines: string[]): Record[] {
	const records: Record[] = [];
	let state = RecordParsingState.None;
	let currentRecord: Record;
	for (const line of lines) {
		const trimmedLine = line.trim();
		if (trimmedLine.length === 0) {
			state = RecordParsingState.None;
			if (currentRecord !== undefined) {
				records.push(currentRecord);
				currentRecord = undefined;
			}
		}
		else if (trimmedLine.match(/\d{4}-\d{2}-\d{2}/) && state === RecordParsingState.None) {
			state = RecordParsingState.Record;
			currentRecord = {
				day: new Date(trimmedLine),
				projects: [],
			}
		}
		else if (state === RecordParsingState.Record) {
			const splitted = trimmedLine.split(':');
			if (splitted.length !== 2 || currentRecord === undefined) {
				throw new Error(`Error while parsing line ${line}`)
			}
			const parseMark = (value: string) => {
				const trimmedValue = value.trim();
				if (trimmedValue === '-') {
					return undefined;
				}
				const mark = parseInt(value);
				if (Number.isNaN(mark) || mark < 1 || mark > 5) {
					throw new Error(`Error while parsing mark ${line}`)
				}
				return mark;
			};
			currentRecord.projects.push({
				name: splitted[0],
				mark: parseMark(splitted[1]) as Mark,
			});
		}
	}
	return records;
}

function readFile(): FileData {
	const data = fs.readFileSync(FILE_NAME);
	const lines = data.toString().split('\n');

	const metadata = parseMetadata(lines);
	const records = parseRecords(lines);

	return { metadata, records };
}

async function readRecordFromConsole(projects: string[], enterDate = false) {
	prompt.start();
	const schema = {
		properties: {
		}
	}

	if (enterDate) {
		Object.assign(schema.properties, { 
			Date: { 
				pattern: /^\d{4}-\d{2}-\d{2}$/,
				required: true
			} 
		})
	}

	projects.forEach((p) => {
		Object.assign(schema.properties, { 
			[p]: { 
				pattern: /^[1-5]$|^-$/,
				required: true
			} 
		})
	});

	return prompt.get(schema);
}

function formatDataForFile(data) {
	return Object.keys(data).map((k) => {
		if (k !== 'Date') {
			return `${k}:${data[k]}`
		} else {
			return `${data[k]}`;
		}
	}).join('\n').concat('\n');
}

function outputDataToConsole(data) {
	const colorizeMark = (value: string) => {
		switch (value) {
			case '1': return chalk.rgb(150, 0, 0).bold(value); 
			case '2': return chalk.rgb(255, 125, 125).bold(value); 
			case '3': return chalk.rgb(255, 255, 75).bold(value); 
			case '4': return chalk.rgb(125, 255, 125).bold(value); 
			case '5': return chalk.rgb(0, 180, 0,).bold(value); 
		}
		return chalk.white(value);
	};

	const DATE_KEY = 'Date';
	if (data.hasOwnProperty(DATE_KEY)) {
		console.log(`${chalk.blue(data[DATE_KEY])}`);
		delete data[DATE_KEY];
	}

	console.log(columnify(Object.keys(data).map((k) => ({
		project: chalk.yellow(k),
		mark: colorizeMark(data[k] as string),
	}))));
}

async function readRangeDateFromConsole() {
	prompt.start();
	const schema = {
		properties: {
			from: {
				pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
				required: true
			},
			to: {
				pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/,
				required: true
			}
		}
	}

	const { from: fromStr, to: toStr } = await prompt.get(schema);
	const from = new Date(fromStr as string);
	const to = new Date(toStr as string);
	if (from > to) {
		throw Error('Date range is invalid');
	}
	return { from, to };
}

function getRangeByType(choice: number) {
	if (isNaN(choice) || choice < 0 || choice > 10) {
		throw new Error(`${choice} is not valid range type`);
	}

	const dayInThePast = (daysToSubtract: number = 0) => {
		const date = new Date();
		date.setDate(date.getDate() + daysToSubtract);
		return date;
	};

	enum Aggregation {
		Day,
		Week,
		Month,
		Year
	};

	const beginingOf = (aggregation: Aggregation) => {
		const date = new Date();
		switch (aggregation) {
			case Aggregation.Day: return date;
			case Aggregation.Week: {
				const day = date.getDay();
				const diff = date.getDate() - day + (day == 0 ? -6 : 1);
				return new Date(date.setDate(diff));
			}
			case Aggregation.Month: return new Date(date.getFullYear(), date.getMonth(), 1);
			case Aggregation.Year: return new Date(date.getFullYear(), 0, 1);
		}
	};

	const choiceMappings = {
		1: beginingOf(Aggregation.Day),
		2: beginingOf(Aggregation.Week),
		3: beginingOf(Aggregation.Month),
		4: beginingOf(Aggregation.Year),
		5: dayInThePast(-7),
		6: dayInThePast(-14),
		7: dayInThePast(-30),
		8: dayInThePast(-90),
		9: dayInThePast(-180),
		10: dayInThePast(-365),
	};
	return { 
		from: new Date(dateFormat(choiceMappings[choice], "yyyy-mm-dd")),
		to: new Date(dateFormat(new Date(), "yyyy-mm-dd")),
		choice: choice,
	};
}

async function readRangeChoiceFromConsole() {
	console.log('Choose pre-defined range or enter custom:')
	console.log(`${chalk.blue('0')}:custom report`);
	console.log(`${chalk.blue('1')}:daily report`);
	console.log(`${chalk.blue('2')}:weekly report`);
	console.log(`${chalk.blue('3')}:monthly report`);
	console.log(`${chalk.blue('4')}:yearly report`);
	console.log(`${chalk.blue('5')}:7-days report`);
	console.log(`${chalk.blue('6')}:14-days report`);
	console.log(`${chalk.blue('7')}:30-days report`);
	console.log(`${chalk.blue('8')}:90-days report`);
	console.log(`${chalk.blue('9')}:180-days report`);
	console.log(`${chalk.blue('10')}:365-days report`);
	prompt.start();
	const schema = {
		properties: {
			choice: {
				pattern: /^[0-9]{1,2}$/,
				required: true
			}
		}
	}

	const { choice } = await prompt.get(schema);
	
	if (choice === '0') {
		const { from, to } = await readRangeDateFromConsole();
		return { from, to, choice: 0 };
	}

	return getRangeByType(choice as number);
}


async function main() {
	try {
		const data = readFile();

		switch (commands.command) {
			case 'add': {
				const enteredData = await readRecordFromConsole(data.metadata.projects);
				const date = dateFormat(new Date(), "yyyy-mm-dd");
				console.log(chalk.blue(date));
				outputDataToConsole(enteredData);
				fs.appendFileSync('productivity.txt', date.concat('\n', formatDataForFile(enteredData), '\n'));
				break;
			}

			case 'addp': {
				const enteredData = await readRecordFromConsole(data.metadata.projects, true);
				outputDataToConsole(enteredData);
				fs.appendFileSync('productivity.txt', formatDataForFile(enteredData).concat('\n'));
				break;
			}

			case 'lsp':
				const projects = data.records.map((r: Record) => r.projects.map((p: EstimatedProject) => p.name));
				const uniqueProjects = Array.from(new Set(projects.flat()));
				const achivedProjects = uniqueProjects.filter((p) => !data.metadata.projects.includes(p));
				console.log('All projects:');
				console.log(chalk.yellow(data.metadata.projects.join('\n')));
				console.log(chalk.gray(achivedProjects.join('\n')));
				break;

			case 'lspa':
				console.log('Active projects:');
				console.log(chalk.yellow(data.metadata.projects.join('\n')));
				break;

			case 'report': {
				const optionDefinitions = [
					{ name: 'absolute', type: Boolean, defaultValue: false },
					{ name: 'range-type', type: Number },
					{ name: 'from-date', type: String },
					{ name: 'to-date', type: String },
				]
				const options = commandLineArgs(optionDefinitions, { argv: commands._unknown || [] });
				const getRange = (options: commandLineArgs.CommandLineOptions) => {
					const rangeType = options['range-type'];
					if (rangeType === undefined) {
						return readRangeChoiceFromConsole();
					} else {
						// TODO: can be entered as string and converted to number
						if (rangeType === 0) {
							const from = new Date(options['from-date']);
							const to = new Date(options['to-date']);
							if (!from || !to) {
								throw new Error('Date range is not specified or invalid');
							}
							return { from, to, choice: 0 };
						}
						return getRangeByType(rangeType);
					}
				};

				const { from, to, choice } = await getRange(options);

				const groupedData = chain(data.records)
					.filter((r) => r.day >= from && r.day <= to)
					.map((r) => r.projects)
					.flatMap()
					.groupBy((assesed) => assesed.name);
				const averageMarkByProject = groupedData.map((group, groupName) => {
					const groupSum = sumBy(group, (assesed) => assesed.mark);
					const filteredGroup = filter(group, (assesed) => assesed.mark !== undefined);
					return { name: groupName, mark: groupSum / filteredGroup.length };
				});
				const maxMarkFromAverages = averageMarkByProject.map(p => p.mark - 1).max();

				const productivityByProject = averageMarkByProject.map((value) => {
					const mark = value.mark - 1;
					const MAX_MARK = 4;
					if (options.absolute) {
						return { name: value.name, productivity: mark / MAX_MARK };
					}
					return { name: value.name, productivity: mark / maxMarkFromAverages };
				});

				const colorizeProductivity = (value: number) => {
					const bar = `■■■■■■■ ${isNaN(value) ? '-' : `${value * 100}%`}`;
					if (isNaN(value)) return chalk.white(bar);
					if (value >= 0 && value < 0.2) return chalk.rgb(150, 0, 0).bold(bar); 
					else if (value >= 0.2 && value < 0.4) return chalk.rgb(255, 125, 125).bold(bar); 
					else if (value >= 0.4 && value < 0.6) return chalk.rgb(255, 255, 75).bold(bar); 
					else if (value >= 0.6 && value < 0.8) return chalk.rgb(125, 255, 125).bold(bar); 
					else return chalk.rgb(0, 180, 0,).bold(bar); 
				};

				const choiceToString = {
					0:'Custom',
					1:'Daily',
					2:'Weekly',
					3:'Monthly',
					4:'Yearly',
					5:'7-days',
					6:'14-days',
					7:'30-days',
					8:'90-days',
					9:'180-days',
					10:'365-days',
				};

				const realtiveness = options.absolute ? 'Absolute' : 'Relative';

				console.log(`${choiceToString[choice]} ${realtiveness} Report for range ${chalk.blue(dateFormat(from, "yyyy-mm-dd"))} - ${chalk.blue(dateFormat(to, "yyyy-mm-dd"))}`);
				const outputData = productivityByProject.map((project) => ({
					name: chalk.yellow(project.name), 
					productivity: colorizeProductivity(project.productivity),
				}));
				console.log(columnify(outputData.value()));

				// TODO:
				// 1. Refactor for output
				// 2. Write tests
				// 3. Correctly tabulize output
				break;
			}
			default:
				console.error('Unknown command');
				break;
		}
	} catch (error) {
		console.error(error);
	}
}

main().catch((err) => console.log(err, 'Error while running'))
