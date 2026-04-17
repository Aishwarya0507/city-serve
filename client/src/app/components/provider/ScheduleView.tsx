import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import {
  ChevronLeft, ChevronRight, Clock, Loader2,
  CalendarDays, User, IndianRupee, CheckCircle2,
  AlertCircle, Timer, CircleDot
} from 'lucide-react';
import API from '../../lib/api';

// Hour rows shown in the timeline (8 AM to 8 PM)
const TIMELINE_START = 8;
const TIMELINE_END = 20;
const HOURS = Array.from({ length: TIMELINE_END - TIMELINE_START }, (_, i) => TIMELINE_START + i);

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; badge: string; icon: React.ReactNode }> = {
  Pending:     { bg: 'bg-amber-500/10',   border: 'border-l-amber-400',   text: 'text-amber-300',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: <AlertCircle className="size-3.5" /> },
  Accepted:    { bg: 'bg-emerald-500/10', border: 'border-l-emerald-400', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 className="size-3.5" /> },
  'In Progress': { bg: 'bg-blue-500/10', border: 'border-l-blue-400',    text: 'text-blue-300',    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',    icon: <Timer className="size-3.5" /> },
  Completed:   { bg: 'bg-gray-500/10',   border: 'border-l-gray-500',    text: 'text-gray-400',    badge: 'bg-gray-500/20 text-gray-300 border-gray-600',       icon: <CircleDot className="size-3.5" /> },
  Rejected:    { bg: 'bg-red-500/10',    border: 'border-l-red-400',     text: 'text-red-400',     badge: 'bg-red-500/20 text-red-400 border-red-500/30',       icon: <CircleDot className="size-3.5" /> },
  Cancelled:   { bg: 'bg-red-500/10',    border: 'border-l-red-400',     text: 'text-red-400',     badge: 'bg-red-500/20 text-red-400 border-red-500/30',       icon: <CircleDot className="size-3.5" /> },
};

const formatHour = (h: number) =>
  h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;

/** Parse "10:30 AM" → hour number (10.5) */
const parseSlotToHour = (slot?: string): number | null => {
  if (!slot) return null;
  const parts = slot.trim().split(' ');
  if (parts.length < 2) return null;
  const [h, m] = parts[0].split(':').map(Number);
  const period = parts[1];
  let hour = h + (m || 0) / 60;
  if (period === 'PM' && h !== 12) hour += 12;
  if (period === 'AM' && h === 12) hour -= 12;
  return hour;
};

export function ScheduleView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/provider');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const dayBookings = bookings.filter(
    b => new Date(b.date).toDateString() === selectedDate.toDateString()
      && b.status !== 'Rejected'
      && b.status !== 'Cancelled'
  );

  const navigateDay = (dir: 'prev' | 'next') => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (dir === 'next' ? 1 : -1));
    setSelectedDate(d);
  };

  // Place bookings on the timeline
  // For a booking, get its hour position from appointmentStartTime or legacy time_slot
  const getBookingHour = (b: any): number => {
    if (b.appointmentStartTime) {
      return parseSlotToHour(b.appointmentStartTime) ?? TIMELINE_START;
    }
    // Legacy: map broad slot labels to approximate start hours
    const slot = (b.time_slot || '').toLowerCase();
    if (slot.includes('9:00 am') || slot.includes('morning'))   return 9;
    if (slot.includes('12:00 pm') || slot.includes('afternoon')) return 12;
    if (slot.includes('4:00 pm') || slot.includes('evening'))   return 16;
    const parsed = parseSlotToHour(b.time_slot);
    return parsed ?? TIMELINE_START;
  };

  // Group day bookings by hour row (integer floor)
  const byHour: Record<number, any[]> = {};
  dayBookings.forEach(b => {
    const h = Math.floor(getBookingHour(b));
    if (!byHour[h]) byHour[h] = [];
    byHour[h].push(b);
  });

  const totalAppts = dayBookings.length;
  const pendingCount = dayBookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = dayBookings.filter(b => b.status === 'Accepted').length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
            <CalendarDays className="size-7" />
          </div>
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tight">Appointment Schedule</h1>
            <p className="text-muted-foreground font-medium mt-0.5">Your daily appointment timeline</p>
          </div>
        </div>
        {/* Day nav */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigateDay('prev')} className="size-9 p-0 rounded-xl">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-bold px-3 min-w-[160px] text-center">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Button size="sm" variant="outline" onClick={() => navigateDay('next')} className="size-9 p-0 rounded-xl">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </motion.div>

      {/* Summary badges */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-3 flex-wrap px-1">
        {[
          { label: 'Total', value: totalAppts, cls: 'bg-primary/10 text-primary border-primary/20' },
          { label: 'Pending', value: pendingCount, cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
          { label: 'Confirmed', value: confirmedCount, cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${s.cls} text-sm font-black`}>
            {s.value} <span className="font-medium">{s.label}</span>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar sidebar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-none shadow-premium rounded-[2rem] bg-card/50 backdrop-blur-xl ring-1 ring-white/10 sticky top-24">
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={date => date && setSelectedDate(date)}
                className="rounded-xl"
                modifiers={{ hasBooking: bookings.map(b => new Date(b.date)) }}
                modifiersClassNames={{ hasBooking: 'font-black underline decoration-primary' }}
              />
              <div className="mt-4 p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-xs font-black text-primary flex items-center gap-2">
                  <Clock className="size-3.5" />
                  {totalAppts} appointment{totalAppts !== 1 ? 's' : ''} on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-none shadow-premium rounded-[2rem] bg-card/50 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border/30">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-primary" />
                <span className="font-black text-lg">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDate.toDateString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {HOURS.map((hour, i) => {
                    const hourBookings = byHour[hour] || [];
                    const isCurrentHour = new Date().getHours() === hour && selectedDate.toDateString() === new Date().toDateString();

                    return (
                      <motion.div
                        key={hour}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`flex border-b border-border/20 last:border-b-0 min-h-[72px] ${
                          isCurrentHour ? 'bg-primary/5' : hourBookings.length > 0 ? '' : ''
                        }`}
                      >
                        {/* Hour label */}
                        <div className={`w-20 shrink-0 pt-4 px-4 text-xs font-black self-start ${
                          isCurrentHour ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {formatHour(hour)}
                          {isCurrentHour && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-1 animate-pulse" />
                          )}
                        </div>

                        {/* Appointment blocks */}
                        <div className="flex-1 py-2 px-3 space-y-2">
                          {hourBookings.length === 0 ? (
                            <div className="h-full flex items-center">
                              <div className="w-full h-px border-t border-dashed border-border/30" />
                            </div>
                          ) : (
                            hourBookings.map(booking => {
                              const st = STATUS_STYLE[booking.status] || STATUS_STYLE['Pending'];
                              return (
                                <motion.div
                                  key={booking._id}
                                  whileHover={{ scale: 1.01, x: 3 }}
                                  onClick={() => setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)}
                                  className={`rounded-2xl border-l-4 px-4 py-3 cursor-pointer transition-all ${st.bg} ${st.border} hover:ring-1 hover:ring-white/10`}
                                >
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Clock className={`size-3.5 shrink-0 ${st.text}`} />
                                      <span className="font-black text-sm truncate">
                                        {booking.service?.title || 'Service'}
                                      </span>
                                    </div>
                                    <Badge className={`text-[10px] font-black border flex items-center gap-1 ${st.badge}`}>
                                      {st.icon}{booking.status}
                                    </Badge>
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 font-medium">
                                      <User className="size-3" />
                                      {booking.user?.name || 'Customer'}
                                    </span>
                                    <span className="flex items-center gap-1 font-bold text-primary">
                                      <IndianRupee className="size-3" />
                                      {booking.service?.price}
                                    </span>
                                    {(booking.appointmentStartTime || booking.time_slot) && (
                                      <span className="font-bold">
                                        {booking.appointmentStartTime || booking.time_slot}
                                        {booking.appointmentEndTime && ` → ${booking.appointmentEndTime}`}
                                      </span>
                                    )}
                                  </div>

                                  {/* Expanded detail */}
                                  <AnimatePresence>
                                    {selectedBooking?._id === booking._id && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="pt-3 mt-3 border-t border-white/10 space-y-2 text-xs font-medium text-muted-foreground">
                                          <div className="flex justify-between">
                                            <span>Appt. ID</span>
                                            <span className="font-black text-foreground">#{booking._id.slice(-8).toUpperCase()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Address</span>
                                            <span className="font-bold text-foreground text-right max-w-[200px] truncate">
                                              {booking.service_address?.full_address || '—'}
                                            </span>
                                          </div>
                                          {booking.isRecurring && (
                                            <div className="flex items-center gap-1.5 text-primary font-black">
                                              <CircleDot className="size-3" /> Recurring ({booking.recurrenceType})
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* No bookings */}
                  {dayBookings.length === 0 && (
                    <div className="py-24 flex flex-col items-center gap-4 text-center px-8">
                      <CalendarDays className="size-12 text-muted-foreground/30" />
                      <p className="text-lg font-black text-muted-foreground">No appointments scheduled</p>
                      <p className="text-sm text-muted-foreground/60 font-medium">
                        You're free on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
