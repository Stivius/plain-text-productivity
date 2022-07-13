import { CompoundProject } from '../src/compoundProject'


describe('CompoundProject', () => {
    test('1-level name', () => {
        const name = new CompoundProject('First');
        expect(name).toMatchSnapshot();
        expect(name.toString()).toEqual('First');
        expect(name.parent).toBeUndefined();
    });

    test('2-level name', () => {
        const name = new CompoundProject('First/Second');
        expect(name).toMatchSnapshot();
        expect(name.toString()).toEqual('First/Second');
        expect(name.parent.toString()).toEqual('First');
        expect(name.parent.parent).toBeUndefined();
    });

    test('2-level name - empty part', () => {
        const construct = () => new CompoundProject('First/');
        expect(construct).toThrowError();
    });

    test('3-level name', () => {
        const name = new CompoundProject('First/Second/Third');
        expect(name).toMatchSnapshot();
        expect(name.toString()).toEqual('First/Second/Third');
        expect(name.parent.toString()).toEqual('First/Second');
        expect(name.parent.parent.toString()).toEqual('First');
    });

    test('3-level name - empty part', () => {
        const construct = () => new CompoundProject('First//Third');
        expect(construct).toThrowError();
    });

    test('comparison', () => {
        const prj = (value: string) => new CompoundProject(value);

        expect(prj('First').isEqual(prj('First'))).toBeTruthy();
        expect(prj('First/Second').isEqual(prj('First/Second'))).toBeTruthy();
        expect(prj('First/Second/Third').isEqual(prj('First/Second/Third'))).toBeTruthy();

        expect(prj('First').isEqual(prj('Second'))).toBeFalsy();
        expect(prj('First').isEqual(prj('First/Second'))).toBeFalsy();
        expect(prj('First/Second').isEqual(prj('First/Second/Third'))).toBeFalsy();
        expect(prj('First/Second').isEqual(prj('First/Third'))).toBeFalsy();
        expect(prj('First/Second/Third').isEqual(prj('First/Second/Fourth'))).toBeFalsy();
    });
});
