const SEPARATOR = "/";

// if has children than can't be used as record
// EstimatedProject contain only leafs

export class CompoundName {
  parent: CompoundName;
  name: string;

  constructor(value: string) {
    const splitted = value.split(SEPARATOR);
    if (splitted.length > 0) {
      const name = splitted.pop();
      if (name.length === 0) {
        throw Error("subpart cannot be empty");
      }
      if (splitted.length > 0) {
        this.parent = new CompoundName(splitted.join(SEPARATOR));
      }
      this.name = name;
    } else {
      this.name = value;
    }
  }

  toString(): string {
    if (this.parent != null) {
      return `${this.parent.toString()}/${this.name}`;
    }
    return this.name;
  }

  isEqual(other: CompoundName): boolean {
    return this.toString() === other.toString();
  }
}

export const searchForCompoundProject = (searchedValue: CompoundName) => {
  return (value: CompoundName) => value.isEqual(searchedValue);
};
