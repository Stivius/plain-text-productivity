import commandLineArgs from 'command-line-args';
import fs from 'fs';
import {readDateFromConsole, readRecordFromConsole} from './readRecordFromInput';
import chalk from 'chalk';
import {formatInputForFile, formatInputForConsole} from './formatInput';
import {FileData, FILE_NAME} from './interfaces';
import {readRangeChoiceFromConsole} from './readRangeChoiceFromInput';
import {getRangeByType} from './getRangeByType';
import {FileParser} from './fileParser';
import {generateReport} from './generateReport';
import {formatReport} from './formatReport';

const commandsDefinitions = [
    { name: 'command', defaultOption: true },
]

const commands = commandLineArgs(commandsDefinitions, { stopAtFirstUnknown: true });

async function addRecord(date: Date, data: FileData) {
    const enteredData = await readRecordFromConsole(data.metadata.activeProjects);
    fs.appendFileSync(FILE_NAME, formatInputForFile(date, enteredData));
    console.log(formatInputForConsole(date, enteredData));
}

async function main() {
    try {
        const parser = new FileParser(FILE_NAME);
        const data: FileData = parser.parse();

        switch (commands.command) {
            case 'add':
                await addRecord(new Date(), data);
                break;

            case 'addp':
                const enteredDate = await readDateFromConsole();
                await addRecord(enteredDate, data);
                break;

            case 'lsp':
                console.log('All projects:');
                console.log(chalk.yellow(data.metadata.activeProjects.join('\n')));
                console.log(chalk.gray(data.metadata.acrhivedProjects.join('\n')));
                break;

            case 'lspa':
                console.log('Active projects:');
                console.log(chalk.yellow(data.metadata.activeProjects.join('\n')));
                break;

            case 'lspar':
                console.log('Archived projects:');
                console.log(chalk.yellow(data.metadata.acrhivedProjects.join('\n')));
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
                const productivityByProject = generateReport(data, from, to, options.absolute);
                console.log(formatReport(productivityByProject, choice, from, to, options.absolute));
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
