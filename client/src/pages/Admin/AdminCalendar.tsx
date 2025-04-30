import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  date: Date;
  type: 'inspection' | 'movein' | 'cleaning' | 'maintenance' | 'pest' | 'ac' | 'fitout' | 'movers';
  clientName: string;
  address: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Sample data for demonstration
const events: Event[] = [
  {
    id: 1,
    title: 'Property Inspection',
    date: new Date(2025, 3, 12),
    type: 'inspection',
    clientName: 'Ahmed Al-Mansouri',
    address: 'Downtown Dubai, Burj Khalifa Area',
    time: '10:00 AM',
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'Deep Cleaning Service',
    date: new Date(2025, 3, 15),
    type: 'cleaning',
    clientName: 'Sarah Johnson',
    address: 'Dubai Marina, Tower 12',
    time: '2:00 PM',
    status: 'scheduled'
  },
  {
    id: 3,
    title: 'AC Maintenance',
    date: new Date(2025, 3, 15),
    type: 'ac',
    clientName: 'Fatima Al-Ali',
    address: 'Dubai Silicon Oasis',
    time: '9:00 AM',
    status: 'scheduled'
  },
  {
    id: 4,
    title: 'Pest Control Treatment',
    date: new Date(2025, 3, 18),
    type: 'pest',
    clientName: 'John Smith',
    address: 'Arabian Ranches',
    time: '11:30 AM',
    status: 'scheduled'
  },
  {
    id: 5,
    title: 'Handyman Service',
    date: new Date(2025, 3, 20),
    type: 'maintenance',
    clientName: 'Mohammed Al-Farsi',
    address: 'Jumeirah Lakes Towers',
    time: '4:00 PM',
    status: 'scheduled'
  }
];

export default function AdminCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Simulated query for events
  const { data: calendarEvents = events } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: async () => {
      // In a real implementation, this would fetch from the API
      return events;
    },
    initialData: events
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const getEventsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    return calendarEvents.filter(
      event => 
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    );
  };

  const getEventColorClass = (type: string) => {
    switch (type) {
      case 'inspection':
        return 'bg-blue-500';
      case 'cleaning':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'pest':
        return 'bg-red-500';
      case 'ac':
        return 'bg-cyan-500';
      case 'fitout':
        return 'bg-purple-500';
      case 'movers':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout title="Calendar" description="Schedule management for all services">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md border w-full"
              modifiers={{
                booked: calendarEvents.map(event => new Date(event.date)),
              }}
              modifiersStyles={{
                booked: { 
                  fontWeight: 'bold',
                  backgroundColor: '#e9f5e9',
                  color: '#1c741c'
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date 
                ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) 
                : 'All Events'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getEventsForDate(date).length > 0 ? (
                getEventsForDate(date).map(event => (
                  <div 
                    key={event.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getEventColorClass(event.type)}`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-4 w-4" />
                        <span>{event.clientName}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.address}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No events scheduled for this date
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <SheetContent>
          {selectedEvent && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedEvent.title}</SheetTitle>
                <SheetDescription>
                  Event details for {selectedEvent.date.toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="mt-1">{selectedEvent.date.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Time</h4>
                    <p className="mt-1">{selectedEvent.time}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Client</h4>
                    <p className="mt-1">{selectedEvent.clientName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <Badge 
                      className={
                        selectedEvent.status === 'scheduled' ? 'bg-blue-500' :
                        selectedEvent.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                      }
                    >
                      {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Address</h4>
                  <p className="mt-1">{selectedEvent.address}</p>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button>Mark Completed</Button>
                  <Button variant="outline">Cancel Event</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}