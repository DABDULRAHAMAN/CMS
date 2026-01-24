import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { auth } from '@/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const { title, start, end, description, type } = body;

        // Authorization Check: Fetch existing event
        const currentEvent = await Event.findById(id);
        if (!currentEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check ownership or team access
        // Personal events: must match session user
        // Team events: simplified, any auth user can edit (for prototype)
        if (currentEvent.type === 'personal' && currentEvent.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Note: If converting from Personal to Team, strictly allowing only owner to do so

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        // We don't typically allow changing type for now to keep simple, 
        // but if we did, we'd need to re-validate ownership.
        // Let's assume type is constant for an event or passed in body matching current.

        let newStart: Date | undefined;
        let newEnd: Date | undefined;

        if (start) {
            newStart = new Date(start);
            updateData.start = newStart;
        }
        if (end) {
            newEnd = new Date(end);
            updateData.end = newEnd;
        }

        // If times are changing, we need to validate and check conflicts
        if (newStart || newEnd) {
            const finalStart = newStart || currentEvent.start;
            const finalEnd = newEnd || currentEvent.end;

            if (finalStart >= finalEnd) {
                return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
            }

            // Conflict Scope: Same logic as POST
            const conflictQuery: any = {
                _id: { $ne: id },
                start: { $lt: finalEnd },
                end: { $gt: finalStart },
            };

            if (currentEvent.type === 'personal') {
                conflictQuery.userId = session.user.id;
                conflictQuery.type = 'personal';
            } else {
                conflictQuery.type = 'team';
            }

            const conflict = await Event.findOne(conflictQuery);

            if (conflict) {
                return NextResponse.json({ error: 'Event overlaps with an existing event' }, { status: 409 });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, updateData, { new: true });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const currentEvent = await Event.findById(id);
        if (!currentEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (currentEvent.type === 'personal' && currentEvent.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await Event.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
