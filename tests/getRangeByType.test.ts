import {getRangeByType} from '../src/getRangeByType'

describe("getRangeByType", () => {
	test("first", () => {
		expect(getRangeByType(0)).toEqual('test');
	})
});

