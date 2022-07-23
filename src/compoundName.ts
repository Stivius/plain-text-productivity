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

  depth(value: number): string {
    if (value < 1)
      throw new Error('Depth should be positive');

    const fullName = this.toString();

    if (this.parent == null)
      return fullName;

    const { depth, name } = this.parent.depthImpl(value);
    if (depth < value)
      return this.toString();

    return name;
  }

  private depthImpl(value: number): { depth: number, name: string } {
    if (this.parent == null) 
      return { depth: 1, name: this.name };
    const result = this.parent.depthImpl(value);
    if (result.depth === value) {
      return result;
    }
    return {
      depth: result.depth + 1,
      name: this.toString(),
    };
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
