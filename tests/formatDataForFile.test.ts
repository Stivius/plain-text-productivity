import {formatDataForFile} from '../src/formatOutput'

const DATA_SAMPLE = {
    Key1:'Value1',
    Key2:'Value2',
    Key3:'Value3',
};

describe('formatDataForFile', () => {
    test('records without date', () => {
        expect(formatDataForFile(DATA_SAMPLE)).toMatchSnapshot();
    });

    test('records with date', () => {
        expect(formatDataForFile({
            Date:'2022-06-01',
            ...DATA_SAMPLE
        })).toMatchSnapshot();
    });
});
