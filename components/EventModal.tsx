'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarEvent, CreateEventInput } from '@/types';
import { format } from 'date-fns';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (event: CreateEventInput) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    initialData?: CalendarEvent | null;
    selectedDate?: Date | null;
    defaultValues?: Partial<CreateEventInput> | null;
}

export function EventModal({ isOpen, onClose, onSubmit, onDelete, initialData, selectedDate, defaultValues }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setIsSubmitting(false);
            if (initialData) {
                setTitle(initialData.title || '');
                // Format for datetime-local input: YYYY-MM-DDTHH:mm
                try {
                    const startDate = new Date(initialData.start);
                    const endDate = new Date(initialData.end);

                    if (!isNaN(startDate.getTime())) {
                        setStart(format(startDate, "yyyy-MM-dd'T'HH:mm"));
                    } else {
                        setStart('');
                    }

                    if (!isNaN(endDate.getTime())) {
                        setEnd(format(endDate, "yyyy-MM-dd'T'HH:mm"));
                    } else {
                        setEnd('');
                    }
                } catch (e) {
                    console.error('Error formatting date', e);
                    setStart('');
                    setEnd('');
                }
                setDescription(initialData.description || '');
            } else if (defaultValues) {
                // Pre-fill for creation (e.g. from NLP)
                setTitle(defaultValues.title || '');
                try {
                    if (defaultValues.start) {
                        setStart(format(new Date(defaultValues.start), "yyyy-MM-dd'T'HH:mm"));
                    } else if (selectedDate) {
                        setStart(format(selectedDate, "yyyy-MM-dd'T'HH:mm"));
                    }

                    if (defaultValues.end) {
                        setEnd(format(new Date(defaultValues.end), "yyyy-MM-dd'T'HH:mm"));
                    } else if (selectedDate) {
                        const endDate = new Date(selectedDate);
                        endDate.setHours(endDate.getHours() + 1);
                        setEnd(format(endDate, "yyyy-MM-dd'T'HH:mm"));
                    }
                } catch (e) {
                    console.error('Error formatting date from defaultValues', e);
                }
                setDescription(defaultValues.description || '');
            } else if (selectedDate) {
                setTitle('');
                try {
                    setStart(format(selectedDate, "yyyy-MM-dd'T'HH:mm"));
                    const endDate = new Date(selectedDate);
                    endDate.setHours(endDate.getHours() + 1);
                    setEnd(format(endDate, "yyyy-MM-dd'T'HH:mm"));
                } catch (e) {
                    console.error('Error formatting date', e);
                }
                setDescription('');
            } else {
                setTitle('');
                setStart('');
                setEnd('');
                setDescription('');
            }
        }
    }, [isOpen, initialData, selectedDate, defaultValues]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await onSubmit({
                title,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
                description,
                type: initialData?.type || 'personal' // Default, but page should override for creation
            });
            onClose();
        } catch (err: any) {
            // console.error(err); // Suppress console error for expected validation handling
            setError(err.message || 'Failed to save event. Check for conflicts.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData || !onDelete) return;
        if (!confirm('Are you sure you want to delete this event?')) return;

        setIsSubmitting(true);
        try {
            await onDelete(initialData.id || initialData._id!); // Ensure _id matches your type definition (usually _id from Mongo)
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to delete event');
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Edit event details below.' : 'Enter event details below.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">Start</Label>
                        <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">End</Label>
                        <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Desc</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between w-full">
                        {initialData && onDelete && (
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>Delete</Button>
                        )}
                        <div className='flex gap-2 ml-auto'>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
