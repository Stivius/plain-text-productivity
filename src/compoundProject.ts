const SEPARATOR = '/'

// if has children than can't be used as record
// EstimatedProject contain only leafs

export class CompoundProject {
    parent: CompoundProject;
    name: string;

    constructor(value: string) {
        const splitted = value.split(SEPARATOR);
        if (splitted.length > 0) {
            const name = splitted.pop();
            if (name.length === 0) {
                throw Error('subpart cannot be empty');
            }
            if (splitted.length > 0) {
                this.parent = new CompoundProject(splitted.join(SEPARATOR));
            }
            this.name = name;
        } else {
            this.name = value;
        }
    }

    toString(): string {
        if (this.parent != null) {
            return `${this.parent.toString()}/${this.name}`
        }
        return this.name;
    }

    isEqual(other: CompoundProject): boolean {
        return this.toString() === other.toString();
    }
}
