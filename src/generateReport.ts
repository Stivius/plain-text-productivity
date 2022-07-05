import chain, {filter, round, sumBy} from 'lodash'
import {FileData, ProductivityReport, ProductivityReportOptions} from './interfaces'

export function generateReport(data: FileData, options: ProductivityReportOptions): ProductivityReport {
    const groupedData = chain(data.records)
    .filter((r) => r.day >= options.from && r.day <= options.to)
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
    const items = averageMarkByProject.map((value) => {
        const mark = value.mark - 1;
        const MAX_MARK = 4;
        if (options.absolute) {
            return { name: value.name, productivity: round(mark / MAX_MARK, 4) };
        }
        return { name: value.name, productivity: round(mark / maxMarkFromAverages, 4) };
    }).value();
    return {
        items: items,
        options: options
    };
}
