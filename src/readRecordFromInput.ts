import prompt from 'prompt';
import {DATE_REGEX, MARK_REGEX} from './interfaces';

export async function readDateFromConsole(): Promise<Date> {
    prompt.start();
    const schema = {
        properties: {
            Date: { 
                pattern: DATE_REGEX,
                required: true
            } 
        }
    }
    const input = await prompt.get(schema);
    return new Date(input.Date as string);
}

export async function readRecordFromConsole(projects: string[]) {
    prompt.start();
    const schema = {
        properties: {
        }
    }

    projects.forEach((p) => {
        Object.assign(schema.properties, { 
            [p]: { 
                pattern: MARK_REGEX,
                required: true
            } 
        })
    });

    return prompt.get(schema);
}

