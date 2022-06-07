import prompt from 'prompt';
import {DATE_REGEX, MARK_REGEX} from './interfaces';

export async function readRecordFromConsole(projects: string[], enterDate = false) {
    prompt.start();
    const schema = {
        properties: {
        }
    }

    // TODO: move to separate method
    if (enterDate) {
        Object.assign(schema.properties, { 
            Date: { 
                pattern: DATE_REGEX,
                required: true
            } 
        })
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

