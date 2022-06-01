"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getRangeByType_1 = require("../src/getRangeByType");
describe("getRangeByType", () => {
    test("first", () => {
        expect((0, getRangeByType_1.getRangeByType)(0)).toEqual('test');
    });
});
