import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import {
  ChevronRight, ArrowUpRight, Trophy, MessageSquare,
  Calendar, Clock, MapPin, Shield, Star, Eye, EyeOff, Copy, AlertCircle, XCircle,
  Repeat, Image as ImageIcon, Zap, CheckCircle2
} from 'lucide-react';
import API from '../../lib/api';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { BookingStatusTracker } from '../ui/BookingStatusTracker';
import { EmptyState } from '../ui/EmptyState';
import { ChatDrawer } from '../ui/ChatDrawer';
import { RescheduleModal } from '../ui/RescheduleModal';
import { useNavigate } from 'react-router';

// Design tokens and variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

const statusMessages: Record<string, { msg: string; icon: string }> = {
  'Pending': { msg: 'Waiting for provider to accept', icon: '⏳' },
  'Accepted': { msg: 'Your appointment is confirmed', icon: '🤝' },
  'In Progress': { msg: 'Our professional is on the way', icon: '🚗' },
  'Completed': { msg: 'Service completed successfully', icon: '✅' },
  'Rejected': { msg: 'Appointment was declined', icon: '❌' },
  'Cancelled': { msg: 'Appointment has been cancelled', icon: '🚫' },
};

const getStatusVariant = (status: string): any => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'In Progress': return 'pulse';
    case 'Rejected':
    case 'Cancelled': return 'destructive';
    default: return 'secondary';
  }
};

const getPinDigits = (pin: any): string[] => {
  if (!pin) return [];
  return String(pin).split('');
};

// Isolated Sub-components
const LiveStatusMessage = memo(({ status }: { status: string }) => {
  const [index, setIndex] = useState(0);
  const inProgressMessages = [
    "Professional is on the way 🚗",
    "Arriving soon ⏳",
    "Expert has reached the location 📍",
    "Service is currently in progress 🛠️",
    "Almost done! Finalizing details ✨"
  ];

  useEffect(() => {
    if (status !== 'In Progress') return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % inProgressMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [status, inProgressMessages.length]);

  const msgInfo = statusMessages[status] || { msg: status, icon: '💡' };

  if (status !== 'In Progress') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xl">{msgInfo.icon}</span>
        <p className="text-xs font-black uppercase tracking-wider text-primary">{msgInfo.msg}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{inProgressMessages[index].split(' ').pop()}</span>
      <AnimatePresence mode="wait">
        <motion.p 
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-xs font-black uppercase tracking-wider text-primary"
        >
          {inProgressMessages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
});

interface BookingCardProps {
  booking: any;
  onViewPin: (b: any) => void;
  onOpenChat: (b: any) => void;
  onRate: (b: any) => void;
  onReschedule: (b: any) => void;
  onCancel: (b: any) => void;
  onToggleRecurrence: (b: any, enabled: boolean) => void;
}

const BookingCard = memo(({ booking, onViewPin, onOpenChat, onRate, onReschedule, onCancel, onToggleRecurrence }: BookingCardProps) => {
  const hasPin = booking.pin && (booking.status === 'Accepted' || booking.status === 'In Progress');
  const isCompleted = booking.status === 'Completed';
  const isCancelled = booking.status === 'Cancelled' || booking.status === 'Rejected';

  return (
    <motion.div variants={itemVariants}>
      <Card className="group relative overflow-hidden border bg-card/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/40 shadow-none hover:shadow-premium transition-all duration-500 rounded-[2rem] h-full">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
                {booking.service?.title?.[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-heading font-black tracking-tight group-hover:text-primary transition-colors">
                  {booking.service?.title}
                </h3>
                <p className="text-sm font-bold text-muted-foreground">{booking.provider?.name || 'Service Pro'}</p>
              </div>
            </div>
            <motion.div animate={booking.status === 'In Progress' ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
              <Badge variant={getStatusVariant(booking.status)} className="rounded-lg px-3 py-1 font-bold">
                {booking.status === 'Accepted' ? 'Confirmed' : booking.status}
              </Badge>
            </motion.div>
          </div>

          {booking.isRecurring && (
            <div className="mb-6 flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Repeat className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Recurring Service</p>
                  <p className="text-xs font-bold capitalize">{booking.recurrenceType} Plan</p>
                </div>
              </div>
            </div>
          )}

          <BookingStatusTracker status={booking.status} />

          <div className="min-h-[3rem] mb-6 p-4 bg-secondary/30 rounded-2xl border-2 border-dashed border-secondary">
             <LiveStatusMessage status={booking.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Scheduled For</p>
               <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Calendar className="size-3.5 text-primary" />
                  {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Appointment Time</p>
               <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Clock className="size-3.5 text-primary" />
                  {booking.appointmentStartTime ? (
                    <span className="flex items-center gap-1">
                      {booking.appointmentStartTime}
                      {booking.appointmentEndTime && <span className="text-muted-foreground font-medium text-[10px]">→ {booking.appointmentEndTime}</span>}
                    </span>
                  ) : (
                    booking.time_slot || '—'
                  )}
               </div>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Amount Paid</p>
               <p className="text-lg font-heading font-black text-primary">₹{booking.price || booking.service?.price}</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Appt. ID</p>
               <p className="text-xs font-mono font-bold">#{booking._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {booking.service_address && (
            <div className="mb-8 p-4 bg-secondary/20 rounded-2xl border border-secondary/50">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                 <MapPin className="size-3 text-primary" /> Service Address
              </p>
              <p className="text-sm font-bold text-foreground leading-tight">
                {booking.service_address.full_address}
              </p>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                {booking.service_address.area}, {booking.service_address.city}
                {booking.service_address.landmark && ` • Near ${booking.service_address.landmark}`}
              </p>
            </div>
          )}

          {booking.rescheduleRequest && booking.rescheduleRequest.status === 'pending' && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
              <Clock className="size-4 text-amber-600 animate-pulse" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-amber-700">Reschedule Pending</p>
                <p className="text-xs font-bold text-amber-800">New date proposed: {new Date(booking.rescheduleRequest.newDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {hasPin && (
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl h-11" onClick={() => onViewPin(booking)}>
                <Shield className="size-4 mr-2" /> View PIN
              </Button>
            )}
            {isCompleted && !booking.rating && (
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl h-11" onClick={() => onRate(booking)}>
                <Star className="size-4 mr-2" /> Rate Now
              </Button>
            )}
            {booking.rating && (
              <div className="flex-1 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center gap-2">
                <Star className="size-4 fill-yellow-500 text-yellow-500" />
                <span className="text-sm font-black text-yellow-700">{booking.rating}/5 Rated</span>
              </div>
            )}
            {!hasPin && !isCompleted && !isCancelled && (
               <Button variant="secondary" className="flex-1 font-black rounded-xl h-11" disabled>Awaiting Start</Button>
            )}
            {isCancelled && (
               <Button variant="secondary" className="flex-1 font-black rounded-xl h-11 bg-rose-500/10 text-rose-600 border-none" disabled>Cancelled</Button>
            )}
            {!isCompleted && !isCancelled && (
              <Button variant="outline" className="size-11 rounded-xl shrink-0 p-0 border-2" onClick={() => onOpenChat(booking)}>
                <MessageSquare className="size-5" />
              </Button>
            )}
          </div>

          {isCompleted && (
            <div className={`mt-8 p-6 rounded-[2rem] border-2 border-dashed transition-all ${booking.isRecurring ? 'bg-primary/5 border-primary/20' : 'bg-secondary/10 border-secondary/20'}`}>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="size-10 rounded-2xl bg-white dark:bg-black/20 flex items-center justify-center shadow-inner">
                        <Repeat className={`size-5 transition-colors ${ booking.isRecurring ? 'text-primary' : 'text-muted-foreground'}`} />
                     </div>
                     <div>
                        <p className="font-black text-sm">Repeat this service?</p>
                        <p className="text-[10px] font-bold text-muted-foreground">
                           {booking.isRecurring ? `Recurring: ${booking.recurrenceType || 'Monthly'}` : 'Automate your maintenance visits.'}
                        </p>
                     </div>
                  </div>
                  <Switch checked={booking.isRecurring} onCheckedChange={(checked) => onToggleRecurrence(booking, checked)} className="scale-110" />
               </div>
            </div>
          )}

          {['Pending', 'Accepted'].includes(booking.status) && (
            <div className="mt-4 pt-4 border-t border-dashed border-secondary grid grid-cols-2 gap-3">
              <Button variant="ghost" className="h-10 text-primary font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/5" onClick={() => onReschedule(booking)} disabled={booking.rescheduleRequest?.status === 'pending'}>
                 <Calendar className="size-3.5 mr-2" /> {booking.rescheduleRequest?.status === 'pending' ? 'Pending' : 'Reschedule'}
              </Button>
              <Button variant="ghost" className="h-10 text-rose-500 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-rose-500/5" onClick={() => onCancel(booking)}>
                 <XCircle className="size-3.5 mr-2" /> Cancel
              </Button>
            </div>
          )}
        </CardContent>
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <ArrowUpRight className="size-5 text-primary" />
        </div>
      </Card>
    </motion.div>
  );
});

export function BookingStatus() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancellationCode, setCancellationCode] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [draftRecurrence, setDraftRecurrence] = useState<Record<string, { type: string, interval?: number }>>({});
  const [recurrenceModalBooking, setRecurrenceModalBooking] = useState<any>(null);
  
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPin = (booking: any) => {
    setSelectedBooking(booking);
    setPinVisible(false);
    setShowPinDialog(true);
  };

  const handleCopyPin = (pinValue: any) => {
    navigator.clipboard.writeText(String(pinValue));
    toast.success('PIN copied to clipboard!');
  };

  const handleOpenChat = (booking: any) => {
    setSelectedBooking(booking);
    setShowChat(true);
  };

  const submitRating = async () => {
    if (!selectedBooking || rating === 0) return;
    try {
      await API.post(`/bookings/${selectedBooking._id}/rate`, { rating });
      toast.success('Thank you for your feedback!');
      fetchBookings();
      setShowRatingDialog(false);
      setRating(0);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleCancelRequest = async (booking: any) => {
    try {
      const { data } = await API.post(`/bookings/${booking._id}/request-cancel`);
      // If the backend returns 'Cancelled', it means the cancellation is immediate
      if (data.status === 'Cancelled' || (data.booking && data.booking.status === 'Cancelled')) {
        toast.success(data.message || 'Appointment cancelled successfully');
        fetchBookings();
      } else if (data.cancellationCode) {
        // If the backend requires a secondary confirmation code
        setCancellationCode(data.cancellationCode);
        setSelectedBooking(booking);
        setShowCancelDialog(true);
        fetchBookings();
      } else {
        // General fallback for status changes
        toast.success('Cancellation request processed');
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const handleToggleRecurrenceMode = (booking: any, enabled: boolean) => {
    if (enabled) {
      setDraftRecurrence({
        ...draftRecurrence,
        [booking._id]: { 
          type: booking.recurrenceType || 'monthly', 
          interval: booking.recurrenceInterval 
        }
      });
      setRecurrenceModalBooking(booking);
    } else {
      commitRecurrence(booking._id, false);
    }
  };

  const updateDraftSetting = (bookingId: string, type: string, interval?: number) => {
    setDraftRecurrence({
      ...draftRecurrence,
      [bookingId]: { type, interval }
    });
  };

  const commitRecurrence = async (bookingId: string, isRecurring: boolean) => {
    try {
      const draft = draftRecurrence[bookingId];
      await API.put(`/bookings/${bookingId}/recurrence`, { 
        isRecurring,
        recurrenceType: draft?.type || 'monthly',
        recurrenceInterval: draft?.interval
      });
      const newDrafts = { ...draftRecurrence };
      delete newDrafts[bookingId];
      setDraftRecurrence(newDrafts);
      setRecurrenceModalBooking(null);
      fetchBookings();
      toast.success(isRecurring ? 'Recurring service confirmed! Next visit scheduled.' : 'Recurring service disabled.');
    } catch (error) {
       console.error('Error saving recurrence:', error);
       toast.error('Failed to save recurring settings');
    }
  };

  const filteredBookingsMap = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      upcoming: sorted.filter(b => b.status === 'Pending' || b.status === 'Accepted'),
      active: sorted.filter(b => b.status === 'In Progress'),
      completed: sorted.filter(b => b.status === 'Completed'),
      cancelled: sorted.filter(b => b.status === 'Rejected' || b.status === 'Cancelled'),
      all: bookings,
    };
  }, [bookings]);

  const getFilteredBookings = (status: string) => (filteredBookingsMap as any)[status] || [];

  const pinDigits = getPinDigits(selectedBooking?.pin);

  return (
    <div className="space-y-10 pb-16">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="px-2">
        <h1 className="text-4xl font-heading font-black tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground font-medium mt-1">Timeline of your scheduled service appointments</p>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-8 rounded-[2rem] bg-card/40 border">
               <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                     <Skeleton className="size-12 rounded-2xl bg-secondary" />
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-32 bg-secondary" />
                        <Skeleton className="h-4 w-24 bg-secondary" />
                     </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg bg-secondary" />
               </div>
               <Skeleton className="h-4 w-full bg-secondary" />
            </motion.div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-10">
          <TabsList className="bg-secondary/50 p-1.5 rounded-[1.25rem] h-14 w-full max-w-2xl border overflow-x-auto">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Completed' },
              { id: 'cancelled', label: 'Cancelled' },
              { id: 'all', label: 'All' }
            ].map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="rounded-xl font-bold text-xs uppercase tracking-widest flex-1 h-full min-w-[100px]">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {['upcoming', 'active', 'completed', 'cancelled', 'all'].map((status) => (
            <TabsContent key={status} value={status} className="mt-0 ring-offset-transparent focus-visible:ring-0">
                <AnimatePresence mode="wait">
                  {getFilteredBookings(status).length === 0 ? (
                    <EmptyState
                      key={status}
                      emoji={status === 'upcoming' ? "📅" : status === 'active' ? "🚗" : status === 'completed' ? "✅" : "📜"}
                      title={
                        status === 'upcoming' ? "No upcoming appointments" :
                        status === 'active' ? "No active appointments" :
                        status === 'completed' ? "No completed services yet" :
                        status === 'cancelled' ? "No cancelled appointments" :
                        "No appointments found"
                      }
                      description={status === 'all' 
                        ? "You haven't made any appointments yet. Browse our premium services to get started!"
                        : `You have no ${status} appointments at the moment.`
                      }
                      actionLabel={status === 'upcoming' || status === 'all' ? "Find a Service" : undefined}
                      onAction={() => navigate('/customer/services')}
                      className="py-32"
                    />
                  ) : (
                    <motion.div key={status + "-list"} variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-2 gap-8">
                      {getFilteredBookings(status).map((booking) => (
                        <BookingCard 
                          key={booking._id} 
                          booking={booking}
                          onViewPin={handleViewPin}
                          onOpenChat={handleOpenChat}
                          onRate={(b) => { setSelectedBooking(b); setShowRatingDialog(true); }}
                          onReschedule={(b) => { setSelectedBooking(b); setShowRescheduleModal(true); }}
                          onCancel={handleCancelRequest}
                          onToggleRecurrence={handleToggleRecurrenceMode}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-none shadow-premium rounded-[2.5rem]">
          <DialogHeader className="pt-4">
            <DialogTitle className="flex flex-col items-center gap-4">
              <div className="size-16 rounded-[1.5rem] bg-primary/10 text-primary flex items-center justify-center">
                 <Shield className="size-8" />
              </div>
              <span className="text-3xl font-heading font-black">Secure PIN</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-4">
            <p className="text-muted-foreground font-medium text-center px-8">
              Share this code with your professional only after the work is completed correctly.
            </p>
            <div className="flex justify-center gap-3">
              {pinDigits.map((char, i) => (
                <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="size-16 border-2 border-primary/20 rounded-2xl flex items-center justify-center bg-white dark:bg-black shadow-inner">
                  <span className="text-3xl font-heading font-black text-primary">{pinVisible ? char : '•'}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold border-2" onClick={() => setPinVisible(!pinVisible)}>
                {pinVisible ? <><EyeOff className="size-4 mr-2" /> Hide</> : <><Eye className="size-4 mr-2" /> Show</>}
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground rounded-xl h-12 font-black shadow-lg" onClick={() => handleCopyPin(selectedBooking?.pin)}>
                <Copy className="size-4 mr-2" /> Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-md bg-white/90 dark:bg-black/90 backdrop-blur-xl border-none shadow-premium rounded-[2.5rem]">
          <DialogHeader className="pt-4 text-center">
             <div className="size-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <Trophy className="size-8" />
             </div>
             <DialogTitle className="text-3xl font-heading font-black tracking-tight">Rate the Pro</DialogTitle>
          </DialogHeader>
          <div className="space-y-10 py-6">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setRating(star)}>
                  <Star className={`size-12 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-foreground/20'}`} />
                </motion.button>
              ))}
            </div>
            <div className="space-y-4">
               <p className="text-center font-black text-primary text-xl min-h-[1.75rem]">
                 {['', 'Needs Improvement 😕', 'Fair 😐', 'Good Service 🙂', 'Highly Recommend! 🤩', 'Absolutely Perfect! 🏆'][rating]}
               </p>
               <Button className="w-full bg-primary text-primary-foreground font-black rounded-xl h-14 text-lg" onClick={submitRating} disabled={rating === 0}>Share Feedback</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Drawer */}
      {selectedBooking && currentUser && (
        <ChatDrawer
          bookingId={selectedBooking._id}
          participantName={selectedBooking.provider?.name || 'Service Provider'}
          isOpen={showChat}
          onOpenChange={setShowChat}
          currentUser={currentUser}
        />
      )}

      {/* Cancellation Code Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-2xl border-none shadow-premium rounded-[2.5rem] p-8">
           <DialogHeader className="items-center text-center pb-2">
             <div className="size-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <AlertCircle className="size-8" />
             </div>
             <DialogTitle className="text-2xl font-black">Cancellation Code</DialogTitle>
             <p className="text-muted-foreground font-medium text-base mt-2 px-2 leading-relaxed">Share this code with the expert to confirm your cancellation.</p>
           </DialogHeader>
           <div className="mt-4 p-6 bg-secondary/30 rounded-[2rem] border-2 border-dashed border-secondary/50 flex flex-col items-center gap-4">
             <div className="flex gap-2">
               {cancellationCode.split('').map((digit, i) => (
                 <motion.div key={i} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="size-12 rounded-xl bg-white dark:bg-black border border-primary/10 flex items-center justify-center text-xl font-black text-primary shadow-sm">
                   {digit}
                 </motion.div>
               ))}
             </div>
             <Button variant="ghost" className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest gap-2" onClick={() => { navigator.clipboard.writeText(cancellationCode); toast.success('Code copied'); }}>
                <Copy className="size-3.5" /> Copy Code
             </Button>
           </div>
           <div className="mt-6">
             <Button className="w-full h-12 rounded-2xl bg-primary text-white font-black" onClick={() => setShowCancelDialog(false)}>Got it</Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      {selectedBooking && showRescheduleModal && (
        <RescheduleModal
          booking={selectedBooking}
          isOpen={showRescheduleModal}
          onOpenChange={setShowRescheduleModal}
          onSuccess={() => fetchBookings()}
        />
      )}

      {/* Setup Recurring Modal */}
      <Dialog open={!!recurrenceModalBooking} onOpenChange={(open) => !open && setRecurrenceModalBooking(null)}>
         <DialogContent className="rounded-[2.5rem] max-w-sm border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-8 text-white relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <DialogTitle className="text-2xl font-black flex items-center gap-3"><Repeat className="size-6" /> Setup Recurring</DialogTitle>
               <p className="text-white/70 text-sm font-medium mt-2">Configure automated maintenance for {recurrenceModalBooking?.service?.title}.</p>
            </div>
            <div className="p-8 space-y-8 bg-card">
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Frequency Plan</Label>
                  <div className="grid grid-cols-1 gap-3">
                     {[ { id: 'weekly', label: 'Weekly', desc: 'Best for gardening & cleaning', icon: Calendar }, { id: 'monthly', label: 'Monthly', desc: 'Standard maintenance plan', icon: Shield }, { id: 'custom', label: 'Custom Interval', desc: 'Set your own specific days', icon: Zap } ].map((type) => (
                        <button key={type.id} onClick={() => updateDraftSetting(recurrenceModalBooking?._id, type.id, type.id === 'custom' ? (draftRecurrence[recurrenceModalBooking?._id]?.interval || 14) : undefined)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${draftRecurrence[recurrenceModalBooking?._id]?.type === type.id ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-secondary hover:border-primary/20'}`}>
                           <div className={`size-10 rounded-xl flex items-center justify-center ${draftRecurrence[recurrenceModalBooking?._id]?.type === type.id ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}><type.icon className="size-5" /></div>
                           <div>
                              <p className="font-black text-sm">{type.label}</p>
                              <p className="text-[10px] font-medium text-muted-foreground">{type.desc}</p>
                           </div>
                        </button>
                     ))}
                  </div>
               </div>
               {draftRecurrence[recurrenceModalBooking?._id]?.type === 'custom' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Days between visits</Label>
                     <Input type="number" min="1" max="365" value={draftRecurrence[recurrenceModalBooking?._id]?.interval || 14} onChange={(e) => updateDraftSetting(recurrenceModalBooking?._id, 'custom', parseInt(e.target.value))} className="h-12 rounded-xl bg-secondary/50 border-2 font-black text-center text-xl" />
                  </motion.div>
               )}
               <div className="flex flex-col gap-3">
                  <Button className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl" onClick={() => commitRecurrence(recurrenceModalBooking?._id, true)}><CheckCircle2 className="size-5 mr-3" /> Confirm & Schedule</Button>
                  <Button variant="ghost" className="w-full h-10 font-bold text-xs uppercase text-muted-foreground" onClick={() => setRecurrenceModalBooking(null)}>Configure Later</Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
