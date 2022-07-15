import { CompoundName, searchForCompoundProject } from '../src/compoundName';
import {generateReport} from '../src/generateReport'
import {FileData, ProductivityReportOptions} from '../src/interfaces'

const firstProject = new CompoundName('first');
const secondProject = new CompoundName('second/something');
const thirdProject = new CompoundName('third');

export const DATA_SAMPLE: FileData = {
    metadata: {
        activeProjects: [ firstProject, secondProject ],
        acrhivedProjects: [ thirdProject ]
    },
    records: [
        {
            day: new Date('2022-07-01'),
            projects: [
                { name: firstProject, mark: 4 },
            ]  
        },
        {
            day: new Date('2022-07-02'),
            projects: [
                { name: firstProject, mark: 2 },
                { name: secondProject, mark: 5 }
            ]  
        },
        {
            day: new Date('2022-07-03'),
            projects: [
                { name: firstProject, mark: 3 },
                { name: secondProject, mark: 1 },
                { name: thirdProject, mark: 5 }
            ]  
        },
        {
            day: new Date('2022-07-04'),
            projects: [
                { name: secondProject, mark: 5 }
            ]  
        }
    ]
};

function options(fromStr: string, toStr: string, absolute: boolean): ProductivityReportOptions {
    return {
        from: new Date(fromStr),
        to: new Date(toStr),
        absolute: absolute,
        choice: 0
    }
}

describe('generateReport', () => {
    test('absolute report', () => {
        expect(generateReport(DATA_SAMPLE, options('2022-07-01', '2022-07-04', true))).toMatchSnapshot();
    });

    test('absolute report for subset days', () => {
        expect(generateReport(DATA_SAMPLE, options('2022-07-02', '2022-07-03', true))).toMatchSnapshot();
    });

    test('relative report', () => {
        expect(generateReport(DATA_SAMPLE, options('2022-07-01', '2022-07-04', false))).toMatchSnapshot();
    });

    test('relative report', () => {
        expect(generateReport(DATA_SAMPLE, options('2022-07-02', '2022-07-03', false))).toMatchSnapshot();
    });

    test('empty day report', () => {
        expect(generateReport({ metadata: DATA_SAMPLE.metadata, records: []}, options('2022-07-01', '2022-07-04', false))).toMatchSnapshot();
    });
});
