'use client';

import { useState, useEffect } from 'react';
import { WeekView } from '@/components/WeekView';
import { MonthView } from '@/components/MonthView'; // Assume this exists
import { EventModal } from '@/components/EventModal';
import { CalendarEvent, CreateEventInput } from '@/types';
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Users, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react'; // Client side signout? No, we need a server action or just redirect to api/auth/signout
// actually next-auth/react has signOut but we didn't setup SessionProvider.
// easier to just link to API or use server action.

import { QuickAddEvent } from '@/components/QuickAddEvent';
import { parseEventInput } from '@/lib/nlp';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [quickAddDefaults, setQuickAddDefaults] = useState<Partial<CreateEventInput> | null>(null);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<'week' | 'month'>('week');
  const [context, setContext] = useState<'personal' | 'team'>('personal');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let start, end;
      if (view === 'week') {
        start = startOfWeek(currentDate).toISOString();
        end = endOfWeek(currentDate).toISOString();
      } else {
        start = startOfMonth(currentDate).toISOString();
        end = endOfMonth(currentDate).toISOString();
      }

      const res = await fetch(`/api/events?start=${start}&end=${end}&type=${context}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      } else if (res.status === 401) {
        // Unauthorized, redirect to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view, context]);

  const handleCreate = async (input: CreateEventInput) => {
    // Override type with current context
    const eventData = { ...input, type: context };

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create event');
    }
    await fetchEvents();
  };

  const handleUpdate = async (input: CreateEventInput) => {
    if (!selectedEvent) return;
    const itemId = selectedEvent.id || selectedEvent._id;
    const res = await fetch(`/api/events/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update event');
    }
    await fetchEvents();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete event');
    }
    await fetchEvents();
  };

  const handleQuickAdd = async (text: string) => {
    const parsed = parseEventInput(text);

    if (parsed.start && parsed.end) {
      try {
        await handleCreate({
          title: parsed.title || 'New Event',
          start: parsed.start,
          end: parsed.end,
          description: '',
          type: context
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      setQuickAddDefaults(parsed);
      setSelectedEvent(null);
      setSelectedDate(null);
      setIsModalOpen(true);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (view === 'week') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    }
  };

  const handleLogout = async () => {
    // Simple logout
    window.location.href = '/api/auth/signout';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-6 border-b flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-xl">CMS</span>
        </div>

        <div className="p-4 space-y-2 flex-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Calendars</div>
          <Button
            variant={context === 'personal' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setContext('personal')}
          >
            <User className="mr-2 h-4 w-4" /> Personal
          </Button>
          <Button
            variant={context === 'team' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setContext('team')}
          >
            <Users className="mr-2 h-4 w-4" /> Team
          </Button>

          <div className="mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Views</div>
          <Button
            variant={view === 'week' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setView('week')}
          >
            Week View
          </Button>
          <Button
            variant={view === 'month' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setView('month')}
          >
            Month View
          </Button>
        </div>

        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shadow-sm gap-4">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap">
              {context === 'personal' ? 'Personal Calendar' : 'Team Calendar'}
            </h2>
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            <QuickAddEvent onParse={handleQuickAdd} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border">
              <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 font-semibold text-gray-700 w-40 text-center select-none">
                {view === 'week'
                  ? `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'd')}`
                  : format(currentDate, 'MMMM yyyy')
                }
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="text-gray-600">Today</Button>
            <Button onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setQuickAddDefaults(null);
              setIsModalOpen(true);
            }} className={cn("shadow-sm", context === 'team' ? "bg-purple-600 hover:bg-purple-700" : "")}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-6">
          {view === 'week' ? (
            <WeekView
              events={events}
              currentDate={currentDate}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setSelectedDate(null);
                setIsModalOpen(true);
              }}
              onSlotClick={(date) => {
                setSelectedEvent(null);
                setSelectedDate(date);
                setIsModalOpen(true);
              }}
            />
          ) : (
            <MonthView
              events={events}
              currentDate={currentDate}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setSelectedDate(null);
                setIsModalOpen(true);
              }}
              onSlotClick={(date) => {
                setSelectedEvent(null);
                setSelectedDate(date);
                setIsModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedEvent ? handleUpdate : handleCreate}
        onDelete={selectedEvent ? handleDelete : undefined}
        initialData={selectedEvent ? { ...selectedEvent, type: context } : { type: context } as any}
        selectedDate={selectedDate}
        defaultValues={quickAddDefaults}
      />
    </div>
  );
}
