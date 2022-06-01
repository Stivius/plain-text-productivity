import prompt from 'prompt';
import {DATE_REGEX} from './interfaces';

export async function readRangeDateFromConsole() {
	prompt.start();
	const schema = {
		properties: {
			from: {
				pattern: DATE_REGEX,
				required: true
			},
			to: {
				pattern: DATE_REGEX,
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

