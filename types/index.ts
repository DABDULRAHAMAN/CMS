export interface CalendarEvent {
    id: string;
    _id?: string;
    title: string;
    start: string; // ISO date string
    end: string;   // ISO date string
    description?: string;
    type: 'personal' | 'team';
}

export type CreateEventInput = Omit<CalendarEvent, '_id' | 'id'>;
