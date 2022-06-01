import chalk from 'chalk';
import columnify from 'columnify'

export function formatDataForFile(data) {
	return Object.keys(data).map((k) => {
		if (k !== 'Date') {
			return `${k}:${data[k]}`
		} else {
			return `${data[k]}`;
		}
	}).join('\n').concat('\n');
}

export function outputDataToConsole(data) {
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

