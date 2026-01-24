'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';

interface MonthViewProps {
    events: CalendarEvent[];
    currentDate: Date;
    onEventClick: (event: CalendarEvent) => void;
    onSlotClick: (date: Date) => void;
}

export function MonthView({ events, currentDate, onEventClick, onSlotClick }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white shadow">
            {/* Header */}
            <div className="grid grid-cols-7 border-b bg-gray-50 text-center">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-sm font-medium text-gray-500 border-r last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {days.map((day) => {
                    const dayEvents = events.filter(e => isSameDay(new Date(e.start), day));
                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "border-b border-r min-h-[100px] p-2 relative hover:bg-gray-50 transition-colors cursor-pointer",
                                !isSameMonth(day, monthStart) && "bg-gray-50 text-gray-400",
                                isSameDay(day, new Date()) && "bg-blue-50"
                            )}
                            onClick={() => onSlotClick(day)}
                        >
                            <div className="text-right text-sm mb-1 font-medium">
                                {format(day, 'd')}
                            </div>
                            <div className="space-y-1">
                                {dayEvents.map((event) => (
                                    <div
                                        key={event.id || event._id}
                                        className={cn(
                                            "text-xs p-1 rounded truncate cursor-pointer",
                                            event.type === 'team'
                                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                                : "bg-blue-100 text-blue-800 border-blue-200",
                                            "border"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
