import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { auth } from '@/auth';

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(request.url);
        const startStr = searchParams.get('start');
        const endStr = searchParams.get('end');
        const type = searchParams.get('type') || 'personal'; // Default to personal

        const query: any = {};

        // Auth Logic:
        // If filtering by personal, must match userId
        // If filtering by team, just match type='team' (simplified "all users share one team" logic for prototype)
        // Or if we want users to see their own personal events AND team events:

        if (type === 'personal') {
            query.userId = session.user.id;
            query.type = 'personal';
        } else if (type === 'team') {
            query.type = 'team';
        }

        if (startStr && endStr) {
            const start = new Date(startStr);
            const end = new Date(endStr);

            query.start = { $lt: end };
            query.end = { $gt: start };
        }

        const events = await Event.find(query).sort({ start: 1 });
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const body = await request.json();
        const { title, start, end, description, type } = body;

        if (!title || !start || !end) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);
        const eventType = type === 'team' ? 'team' : 'personal';

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        if (startDate >= endDate) {
            return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
        }

        // Conflict detection
        // For PERSONAL events: Check conflict with user's other PERSONAL events
        // For TEAM events: Check conflict with other TEAM events
        // (Optional: Check if personal overlaps team? Let's keep distinct contexts for now)

        const conflictQuery: any = {
            start: { $lt: endDate },
            end: { $gt: startDate },
        };

        if (eventType === 'personal') {
            conflictQuery.userId = session.user.id;
            conflictQuery.type = 'personal';
        } else {
            conflictQuery.type = 'team';
        }

        const conflict = await Event.findOne(conflictQuery);

        if (conflict) {
            return NextResponse.json({
                error: 'Event overlaps with an existing event in this calendar',
                conflict: conflict
            }, { status: 409 });
        }

        const newEvent = await Event.create({
            title,
            start: startDate,
            end: endDate,
            description,
            userId: session.user.id,
            type: eventType
        });

        return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
