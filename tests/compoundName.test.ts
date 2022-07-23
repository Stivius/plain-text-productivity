import { CompoundName } from "../src/compoundName";

describe("CompoundName", () => {
  test("1-level name", () => {
    const name = new CompoundName("First");
    expect(name).toMatchSnapshot();
    expect(name.toString()).toEqual("First");
    expect(name.parent).toBeUndefined();
  });

  test("2-level name", () => {
    const name = new CompoundName("First/Second");
    expect(name).toMatchSnapshot();
    expect(name.toString()).toEqual("First/Second");
    expect(name.parent.toString()).toEqual("First");
    expect(name.parent.parent).toBeUndefined();
  });

  test("2-level name - empty part", () => {
    const construct = () => new CompoundName("First/");
    expect(construct).toThrowError();
  });

  test("3-level name", () => {
    const name = new CompoundName("First/Second/Third");
    expect(name).toMatchSnapshot();
    expect(name.toString()).toEqual("First/Second/Third");
    expect(name.parent.toString()).toEqual("First/Second");
    expect(name.parent.parent.toString()).toEqual("First");
  });

  test("3-level name - empty part", () => {
    const construct = () => new CompoundName("First//Third");
    expect(construct).toThrowError();
  });

  test("depth - 1-level", () => {
    const name = new CompoundName("1");
    expect(() => name.depth(-1)).toThrowError();
    expect(() => name.depth(0)).toThrowError();
    expect(name.depth(1)).toEqual("1");
    expect(name.depth(2)).toEqual("1");
    expect(name.depth(3)).toEqual("1");
  });

  test("depth - multi-level", () => {
    const name = new CompoundName("1/2/3/4");
    expect(() => name.depth(-1)).toThrowError();
    expect(() => name.depth(0)).toThrowError();
    expect(name.depth(1)).toEqual("1");
    expect(name.depth(2)).toEqual("1/2");
    expect(name.depth(3)).toEqual("1/2/3");
    expect(name.depth(4)).toEqual("1/2/3/4");
    expect(name.depth(5)).toEqual("1/2/3/4");
    expect(name.depth(6)).toEqual("1/2/3/4");
  });

  test("comparison", () => {
    const prj = (value: string) => new CompoundName(value);

    expect(prj("First").isEqual(prj("First"))).toBeTruthy();
    expect(prj("First/Second").isEqual(prj("First/Second"))).toBeTruthy();
    expect(
      prj("First/Second/Third").isEqual(prj("First/Second/Third"))
    ).toBeTruthy();

    expect(prj("First").isEqual(prj("Second"))).toBeFalsy();
    expect(prj("First").isEqual(prj("First/Second"))).toBeFalsy();
    expect(prj("First/Second").isEqual(prj("First/Second/Third"))).toBeFalsy();
    expect(prj("First/Second").isEqual(prj("First/Third"))).toBeFalsy();
    expect(
      prj("First/Second/Third").isEqual(prj("First/Second/Fourth"))
    ).toBeFalsy();
  });
});
