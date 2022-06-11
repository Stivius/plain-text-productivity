import chain, {filter, round, sumBy} from 'lodash'
import {FileData} from './interfaces'

export function generateReport(data: FileData, from: Date, to: Date, absolute: boolean) {
    const groupedData = chain(data.records)
    .filter((r) => r.day >= from && r.day <= to)
    .map((r) => r.projects)
    .flatMap()
    .filter((p) => data.metadata.activeProjects.indexOf(p.name) !== -1)
    .groupBy((assesed) => assesed.name);
    const averageMarkByProject = groupedData.map((group, groupName) => {
        const groupSum = sumBy(group, (assesed) => assesed.mark);
        const filteredGroup = filter(group, (assesed) => assesed.mark !== undefined);
        return { name: groupName, mark: groupSum / filteredGroup.length };
    });
    const maxMarkFromAverages = averageMarkByProject.map(p => p.mark - 1).max();
    return averageMarkByProject.map((value) => {
        const mark = value.mark - 1;
        const MAX_MARK = 4;
        if (absolute) {
            return { name: value.name, productivity: round(mark / MAX_MARK, 4) };
        }
        return { name: value.name, productivity: round(mark / maxMarkFromAverages, 4) };
    });
}
