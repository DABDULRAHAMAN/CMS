'use client';

import React, { useMemo } from 'react';
import { format, startOfWeek, addDays, getDay, getHours, getMinutes, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils'; // Assuming utils will be created by shadcn or me

interface WeekViewProps {
    events: CalendarEvent[];
    currentDate: Date;
    onEventClick: (event: CalendarEvent) => void;
    onSlotClick: (start: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = Array.from({ length: 7 }, (_, i) => i); // 0 = Sunday, 1 = Monday...

export function WeekView({ events, currentDate, onEventClick, onSlotClick }: WeekViewProps) {
    const weekStart = startOfWeek(currentDate);
    const days = DAYS.map((i) => addDays(weekStart, i));

    // Helper to position events
    const getEventStyle = (event: CalendarEvent) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        // Simple calculation: top = offset from midnight in minutes
        // height = duration in minutes
        // This doesn't handle overlapping visually well (just stacks), but fits "minimal"

        const startMinutes = getHours(start) * 60 + getMinutes(start);
        const endMinutes = getHours(end) * 60 + getMinutes(end);
        const duration = endMinutes - startMinutes;

        return {
            top: `${(startMinutes / 60) * 100}px`, // 1 hour = 100px height
            height: `${(duration / 60) * 100}px`,
            left: '0%',
            width: '95%', // leave some space
        };
    };

    return (
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow">
            {/* Header */}
            <div className="flex border-b bg-gray-50">
                <div className="w-16 flex-shrink-0 border-r"></div>
                {days.map((day) => (
                    <div key={day.toISOString()} className="flex-1 text-center py-2 border-r last:border-r-0">
                        <div className="text-sm font-medium text-gray-500">{format(day, 'EEE')}</div>
                        <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>
                            {format(day, 'd')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative h-[600px]">
                <div className="flex relative min-h-[2400px]"> {/* 24 hours * 100px */}
                    {/* Time Labels */}
                    <div className="w-16 flex-shrink-0 border-r bg-gray-50 sticky left-0 z-10">
                        {HOURS.map((hour) => (
                            <div key={hour} className="h-[100px] border-b text-xs text-gray-400 text-center relative">
                                <span className="absolute -top-3 left-0 right-0">{format(new Date().setHours(hour, 0), 'ha')}</span>
                            </div>
                        ))}
                    </div>

                    {/* Day Columns */}
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex-1 relative border-r last:border-r-0 min-w-[100px]">
                            {/* Hour Slots for Click */}
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="h-[100px] border-b hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={() => {
                                        const slotStart = new Date(day);
                                        slotStart.setHours(hour, 0, 0, 0);
                                        onSlotClick(slotStart);
                                    }}
                                >
                                </div>
                            ))}

                            {/* Events */}
                            {events
                                .filter((event) => isSameDay(new Date(event.start), day))
                                .map((event) => (
                                    <div
                                        key={event.id || event._id}
                                        className="absolute bg-blue-100 border border-blue-300 rounded p-1 text-xs overflow-hidden hover:bg-blue-200 cursor-pointer z-10"
                                        style={getEventStyle(event)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                    >
                                        <div className="font-semibold text-blue-800 truncate">{event.title}</div>
                                        <div className="text-blue-600 truncate">
                                            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
