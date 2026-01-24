import * as chrono from 'chrono-node';
import { CreateEventInput } from '@/types';

interface ParsedEvent extends Partial<CreateEventInput> {
    originalText: string;
}

export function parseEventInput(input: string): ParsedEvent {
    const results = chrono.parse(input);

    if (results.length === 0) {
        return {
            title: input,
            originalText: input
        };
    }

    const result = results[0];
    const start = result.start.date();
    let end = result.end ? result.end.date() : null;

    // If no end time specified, default to 1 hour after start
    if (!end) {
        end = new Date(start);
        end.setHours(end.getHours() + 1);
    }

    // Extract title by removing the matched date/time text from the input
    // This is a simple heuristic; might leave some prepositions
    let title = input;
    const matchText = result.text;

    // Remove the match text
    title = title.replace(matchText, '').trim();

    // Clean up common lingering prepositions if they were at the split point
    title = title.replace(/\s+(at|on|in|from|to)\s*$/, '').trim();
    title = title.replace(/^\s*(at|on|in|from|to)\s+/, '').trim();

    if (!title) {
        title = "New Event";
    }

    return {
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        originalText: input
    };
}
