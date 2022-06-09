import commandLineArgs from 'command-line-args';
import fs from 'fs';
import dateFormat from 'dateformat'
import {readRecordFromConsole} from './readRecordFromInput';
import chalk from 'chalk';
import {formatDataForFile, outputDataToConsole} from './formatOutput';
import {EstimatedProject, FileData, FILE_NAME, ProjectRecord} from './interfaces';
import {readRangeChoiceFromConsole} from './readRangeChoiceFromInput';
import {getRangeByType} from './getRangeByType';
import {FileParser} from './fileParser';
import {generateReport} from './generateReport';
import {outputReport} from './outputReport';

const commandsDefinitions = [
    { name: 'command', defaultOption: true },
]

const commands = commandLineArgs(commandsDefinitions, { stopAtFirstUnknown: true });

async function main() {
    try {
        const parser = new FileParser(FILE_NAME);
        const data: FileData = parser.parse();

        switch (commands.command) {
            // TODO: refactor output to console/file
            case 'add': {
                const enteredData = await readRecordFromConsole(data.metadata.activeProjects);
                const date = dateFormat(new Date(), "yyyy-mm-dd");
                console.log(chalk.blue(date));
                fs.appendFileSync(FILE_NAME, date.concat('\n', formatDataForFile(enteredData), '\n'));
                outputDataToConsole(enteredData);
                break;
            }

            case 'addp': {
                const enteredData = await readRecordFromConsole(data.metadata.activeProjects, true);
                fs.appendFileSync(FILE_NAME, formatDataForFile(enteredData).concat('\n'));
                outputDataToConsole(enteredData);
                break;
            }

            case 'lsp':
                const projects = data.records.map((r: ProjectRecord) => r.projects.map((p: EstimatedProject) => p.name));
            const uniqueProjects = Array.from(new Set(projects.flat()));
            const achivedProjects = uniqueProjects.filter((p) => !data.metadata.activeProjects.includes(p));
            console.log('All projects:');
            console.log(chalk.yellow(data.metadata.activeProjects.join('\n')));
            console.log(chalk.gray(achivedProjects.join('\n')));
            break;

            case 'lspa':
                console.log('Active projects:');
            console.log(chalk.yellow(data.metadata.activeProjects.join('\n')));
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
                const productivityByProject = generateReport(data.records, from, to, options.absolute);
                outputReport(productivityByProject, choice, from, to, options.absolute);
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
