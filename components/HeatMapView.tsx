'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { CalendarEvent } from '@/types';
import { cn } from '@/lib/utils';

interface HeatMapViewProps {
    events: CalendarEvent[];
    currentDate: Date;
    onSlotClick: (date: Date) => void;
}

export function HeatMapView({ events, currentDate, onSlotClick }: HeatMapViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getIntensityClass = (count: number) => {
        if (count === 0) return '';
        if (count <= 2) return 'bg-red-100 hover:bg-red-200';
        if (count <= 5) return 'bg-red-300 hover:bg-red-400';
        return 'bg-red-500 hover:bg-red-600 text-white';
    };

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
                    const count = dayEvents.length;
                    const intensityClass = getIntensityClass(count);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "border-b border-r min-h-[100px] p-2 relative transition-colors cursor-pointer flex flex-col items-end justify-start",
                                !isSameMonth(day, monthStart) && "bg-gray-50 text-gray-400",
                                isToday && count === 0 && "bg-blue-50",
                                intensityClass
                            )}
                            onClick={() => onSlotClick(day)}
                        >
                            <div className={cn(
                                "text-sm font-medium mb-1",
                                count > 5 ? "text-white" : "text-gray-700"
                            )}>
                                {format(day, 'd')}
                            </div>

                            {count > 0 && (
                                <div className={cn(
                                    "text-xs font-semibold mt-auto",
                                    count > 5 ? "text-white" : "text-gray-500"
                                )}>
                                    {count} {count === 1 ? 'event' : 'events'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
