import dateFormat from "dateformat";

enum Aggregation {
    Day,
    Week,
    Month,
    Year
};

const dayInThePast = (daysToSubtract: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToSubtract);
    return date;
};

const beginingOf = (aggregation: Aggregation) => {
    const date = new Date();
    switch (aggregation) {
        case Aggregation.Day: return date;
        case Aggregation.Week: {
            const day = date.getDay();
            const diff = date.getDate() - day + (day == 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        }
        case Aggregation.Month: return new Date(date.getFullYear(), date.getMonth(), 1);
        case Aggregation.Year: return new Date(date.getFullYear(), 0, 1);
    }
};

// TODO: change number to enum
export function getRangeByType(choice: number) {
    if (isNaN(choice) || choice < 1 || choice > 10) {
        throw new Error(`${choice} is not valid range type`);
    }

    const choiceMappings = {
        1: beginingOf(Aggregation.Day),
        2: beginingOf(Aggregation.Week),
        3: beginingOf(Aggregation.Month),
        4: beginingOf(Aggregation.Year),
        5: dayInThePast(-7),
        6: dayInThePast(-14),
        7: dayInThePast(-30),
        8: dayInThePast(-90),
        9: dayInThePast(-180),
        10: dayInThePast(-365),
    };

    return { 
        from: new Date(dateFormat(choiceMappings[choice], "yyyy-mm-dd")),
        to: new Date(dateFormat(new Date(), "yyyy-mm-dd")),
        choice: choice,
    };
}

