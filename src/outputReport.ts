import chalk from "chalk";
import columnify from "columnify";
import dateFormat from "dateformat";

const colorizeProductivity = (value: number) => {
	const bar = `■■■■■■■ ${isNaN(value) ? '-' : `${value * 100}%`}`;
	if (isNaN(value)) return chalk.white(bar);
	if (value >= 0 && value < 0.2) return chalk.rgb(150, 0, 0).bold(bar); 
	else if (value >= 0.2 && value < 0.4) return chalk.rgb(255, 125, 125).bold(bar); 
	else if (value >= 0.4 && value < 0.6) return chalk.rgb(255, 255, 75).bold(bar); 
	else if (value >= 0.6 && value < 0.8) return chalk.rgb(125, 255, 125).bold(bar); 
	else return chalk.rgb(0, 180, 0,).bold(bar); 
};

const ChoiceToString = {
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


// TODO: not any
// TODO: should not log here but just prepare output so it will be testable
export function outputReport(productivityByProject: any, choice: number, from: Date, to: Date, absolute: boolean) {
	const realtiveness = absolute ? 'Absolute' : 'Relative';

	console.log(`${ChoiceToString[choice]} ${realtiveness} Report for range ${chalk.blue(dateFormat(from, "yyyy-mm-dd"))} - ${chalk.blue(dateFormat(to, "yyyy-mm-dd"))}`);
	const outputData = productivityByProject.map((project) => ({
		name: chalk.yellow(project.name), 
		productivity: colorizeProductivity(project.productivity),
	}));
	console.log(columnify(outputData.value()));
}
