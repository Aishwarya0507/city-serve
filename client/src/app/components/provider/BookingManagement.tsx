import { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import {
  Calendar, CreditCard, ShieldCheck, ArrowRight, Activity, AlertCircle, MessageSquare,
  CheckCircle, XCircle, User, Loader2, Repeat, Clock
} from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';
import { BookingStatusTracker } from '../ui/BookingStatusTracker';
import { ChatDrawer } from '../ui/ChatDrawer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export function BookingManagement() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showCancelVerifyDialog, setShowCancelVerifyDialog] = useState(false);
  const [cancelCode, setCancelCode] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('userInfo') || '{}'), []);

  const fetchBookings = async () => {
    try {
      const { data } = await API.get('/bookings/provider');
      // Sort chronologically (upcoming first)
      const sorted = [...data].sort((a: any, b: any) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
        
        // Secondary sort by time if dates are same
        const timeA = a.appointmentStartTime || a.time_slot || '';
        const timeB = b.appointmentStartTime || b.time_slot || '';
        return timeA.localeCompare(timeB);
      });
      setBookings(sorted);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status });
      toast.success(`Appointment ${status.toLowerCase()}!`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleCompleteService = (booking: any) => {
    setSelectedBooking(booking);
    setShowPinDialog(true);
  };

  const verifyPin = async () => {
    if (enteredPin.length !== 6) return;
    setIsVerifying(true);
    setPinError(false);
    try {
      await API.post(`/bookings/${selectedBooking._id}/verify-pin`, { pin: enteredPin });
      toast.success('Service completed successfully!');
      setShowPinDialog(false);
      setEnteredPin('');
      fetchBookings();
    } catch (error: any) {
      setPinError(true);
      toast.error(error.response?.data?.message || 'Invalid PIN');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCancellation = async () => {
    if (cancelCode.length !== 6) return toast.error('Please enter a 6-digit code');
    setIsVerifying(true);
    try {
      await API.post(`/bookings/${selectedBooking._id}/confirm-cancel`, { code: cancelCode });
      toast.success('Appointment cancelled successfully');
      setBookings(bookings.map(b => b._id === selectedBooking._id ? { ...b, status: 'Cancelled', cancelRequested: false } : b));
      setShowCancelVerifyDialog(false);
      setCancelCode('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
      setPinError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRescheduleAction = async (bookingId: string, action: 'approved' | 'rejected') => {
    try {
      await API.put(`/bookings/${bookingId}/reschedule`, { action });
      toast.success(`Reschedule request ${action}!`);
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleOpenChat = (booking: any) => {
    setSelectedBooking(booking);
    setShowChat(true);
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'Completed': return 'success';
      case 'Pending': return 'warning';
      case 'In Progress': return 'pulse';
      case 'Rejected': return 'destructive';
      case 'Accepted': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-2"
      >
        <h1 className="text-4xl font-heading font-black tracking-tight">Appointment Queue</h1>
        <p className="text-muted-foreground font-medium mt-1">Accept and manage your customer service appointments</p>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-44 rounded-[2rem]" />)}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {bookings.length === 0 ? (
             <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="bg-secondary/20 rounded-[2.5rem] border border-dashed py-24 text-center"
             >
               <div className="size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 text-3xl">📭</div>
               <h3 className="text-2xl font-bold mb-2">No active appointments</h3>
               <p className="text-muted-foreground max-w-sm mx-auto">New service requests from customers in your area will appear here. Stay tuned!</p>
             </motion.div>
          ) : bookings.map((booking) => (
            <motion.div key={booking._id} variants={itemVariants}>
              <Card className="group border bg-card/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/40 shadow-none hover:shadow-premium transition-all duration-500 rounded-[2rem] overflow-hidden">
                <CardContent className="p-8">
                   <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left: Service Info */}
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                                <Badge variant={getStatusVariant(booking.status)} className="rounded-lg px-3 py-1 font-bold">
                                   {booking.status}
                                </Badge>
                                {booking.isRecurring && (
                                   <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 font-black">
                                      <Repeat className="size-3" /> Recurring
                                   </Badge>
                                )}
                             </div>
                            <span className="text-[10px] font-mono font-black text-muted-foreground">ID: #{booking._id.slice(-6).toUpperCase()}</span>
                         </div>
                         <h3 className="text-2xl font-heading font-black tracking-tight mb-2 truncate group-hover:text-primary transition-colors">
                            {booking.service?.title}
                         </h3>
                         
                         <BookingStatusTracker status={booking.status} />

                         <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Customer</p>
                               <div className="flex items-center gap-2 text-sm font-bold truncate">
                                  <User className="size-3.5 text-primary" /> {booking.user?.name}
                               </div>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Schedule</p>
                               <div className="flex items-center gap-2 text-sm font-bold">
                                  <Calendar className="size-3.5 text-primary" /> {new Date(booking.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                  <span className="text-primary/40">·</span>
                                  <Clock className="size-3.5 text-primary" /> {booking.appointmentStartTime || booking.time_slot}
                               </div>
                            </div>
                             <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Earnings</p>
                                <div className="flex items-center gap-2 text-lg font-heading font-black text-primary">
                                   ₹{booking.price || booking.service?.price}
                                </div>
                            </div>
                         </div>

                         {booking.rescheduleRequest && booking.rescheduleRequest.status === 'pending' && (
                            <div className="mt-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden group/resched">
                               <div className="absolute top-0 right-0 p-4">
                                  <Clock className="size-5 text-amber-500 animate-pulse" />
                               </div>
                               <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-2">
                                  <Clock className="size-3" /> Reschedule Requested
                               </h4>
                               <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                     <p className="text-[10px] font-black uppercase text-amber-600/70">Proposed Time</p>
                                     <p className="text-sm font-black text-amber-900">
                                        {new Date(booking.rescheduleRequest.newDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
                                     </p>
                                     <p className="text-xs font-bold text-amber-800">{booking.rescheduleRequest.newTimeSlot}</p>
                                  </div>
                                  <div className="flex flex-col justify-center gap-2">
                                     <div className="flex gap-2">
                                        <Button 
                                           size="sm" 
                                           className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl h-10 shadow-lg shadow-amber-500/20"
                                           onClick={() => handleRescheduleAction(booking._id, 'approved')}
                                        >
                                           Accept
                                        </Button>
                                        <Button 
                                           size="sm" 
                                           variant="ghost"
                                           className="flex-1 text-amber-700 hover:bg-amber-500/10 font-bold rounded-xl h-10"
                                           onClick={() => handleRescheduleAction(booking._id, 'rejected')}
                                        >
                                           Decline
                                        </Button>
                                     </div>
                                     {booking.rescheduleRequest.reason && (
                                        <p className="text-[10px] font-medium text-amber-700 italic truncate">"{booking.rescheduleRequest.reason}"</p>
                                     )}
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>

                      {/* Right: Actions */}
                      <div className="lg:w-56 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8">
                         {booking.status === 'Pending' && (
                            <>
                               <Button
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl h-12 shadow-lg shadow-emerald-500/20"
                                  onClick={() => handleUpdateStatus(booking._id, 'Accepted')}
                               >
                                  <CheckCircle className="size-4 mr-2" /> Accept
                               </Button>
                               <Button
                                  variant="ghost"
                                  className="w-full text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl h-12"
                                  onClick={() => handleUpdateStatus(booking._id, 'Rejected')}
                               >
                                  <XCircle className="size-4 mr-2" /> Reject
                               </Button>
                            </>
                         )}
                         {booking.status === 'Accepted' && (
                            <Button
                               className="w-full bg-primary text-primary-foreground font-black rounded-xl h-12 shadow-lg"
                               onClick={() => handleUpdateStatus(booking._id, 'In Progress')}
                            >
                               <Activity className="size-4 mr-2" /> Start Now
                            </Button>
                         )}
                         {booking.status === 'In Progress' && !booking.cancelRequested && (
                            <Button
                               className="w-full bg-primary text-primary-foreground font-black rounded-xl h-12 shadow-lg"
                               onClick={() => handleCompleteService(booking)}
                            >
                               <ShieldCheck className="size-4 mr-2" /> Complete
                            </Button>
                         )}
                         {booking.cancelRequested && (
                            <Button
                               className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl h-12 shadow-lg shadow-rose-500/20"
                               onClick={() => { setSelectedBooking(booking); setShowCancelVerifyDialog(true); }}
                            >
                               <AlertCircle className="size-4 mr-2" /> Verify Cancel
                            </Button>
                         )}
                         {booking.status === 'Completed' && (
                            <div className="text-center py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                               <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-0.5">Verified</p>
                               <p className="text-xs font-bold text-emerald-700">Earnings Credited</p>
                            </div>
                         )}
                         {booking.status === 'Rejected' && (
                            <div className="text-center py-2 bg-secondary rounded-xl">
                               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cancelled</p>
                            </div>
                         )}
                         {!['Completed', 'Rejected', 'Cancelled'].includes(booking.status) && (
                            <Button
                               variant="outline"
                               className="w-full font-bold rounded-xl h-11 border-2 mt-2"
                               onClick={() => handleOpenChat(booking)}
                            >
                               <MessageSquare className="size-4 mr-2" /> Message Customer
                            </Button>
                         )}
                      </div>
                   </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
           {/* PIN Verification Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-3xl border-none shadow-premium rounded-[2.5rem] p-10 ring-1 ring-white/10">
           <DialogHeader className="items-center text-center">
             <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6 animate-pulse-soft">
                <ShieldCheck className="size-10" />
             </div>
             <DialogTitle className="text-3xl font-heading font-black tracking-tight">Verify Delivery</DialogTitle>
             <p className="text-muted-foreground font-medium text-lg mt-2 px-4">Enter the 6-digit PIN provided by the customer to finalize the service.</p>
          </DialogHeader>
          
          <div className={`py-10 flex flex-col items-center ${pinError ? 'animate-shake' : ''}`}>
             <div className="flex gap-3">
                {[0, 1, 2, 3, 4, 5].map(i => (
                   <input
                      key={i}
                      id={`pin-input-${i}`}
                      type="text"
                      maxLength={1}
                      className={`size-14 rounded-2xl bg-secondary/50 border-2 font-black text-2xl text-center focus:outline-none transition-all duration-300 ${
                         pinError ? 'border-rose-500 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 
                         isVerifying ? 'opacity-50 grayscale' :
                         'border-primary/20 focus:border-primary focus:shadow-glow'
                      }`}
                      value={enteredPin[i] || ''}
                      onChange={(e) => {
                         const val = e.target.value;
                         if (/^[0-9]$/.test(val)) {
                            const newPin = enteredPin.split('');
                            newPin[i] = val;
                            const pinStr = newPin.join('');
                            setEnteredPin(pinStr);
                            if (i < 5) document.getElementById(`pin-input-${i+1}`)?.focus();
                         } else if (val === '') {
                            const newPin = enteredPin.split('');
                            newPin[i] = '';
                            setEnteredPin(newPin.join(''));
                         }
                      }}
                      onKeyDown={(e) => {
                         if (e.key === 'Backspace' && !enteredPin[i] && i > 0) {
                            document.getElementById(`pin-input-${i-1}`)?.focus();
                         }
                      }}
                   />
                ))}
             </div>
             <AnimatePresence>
                {pinError && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="mt-6 flex items-center gap-2 text-rose-500 font-black uppercase text-xs tracking-widest"
                   >
                      <AlertCircle className="size-4" /> Invalid PIN. Verification Failed.
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-4">
             <Button
                className="w-full bg-primary text-primary-foreground font-black rounded-2xl h-16 text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                onClick={verifyPin}
                disabled={enteredPin.length !== 6 || isVerifying}
             >
                {isVerifying ? (
                   <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Processing...</>
                ) : (
                   <><CheckCircle className="size-6 mr-3" /> Confirm & Get Paid</>
                )}
             </Button>
             <Button
                variant="ghost"
                className="w-full font-bold rounded-xl h-12 opacity-50 hover:opacity-100"
                onClick={() => {
                  setShowPinDialog(false);
                  setEnteredPin('');
                  setPinError(false);
                }}
             >
                Cancel & Return
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Verification Dialog */}
      <Dialog open={showCancelVerifyDialog} onOpenChange={setShowCancelVerifyDialog}>
        <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-3xl border-none shadow-premium rounded-[2.5rem] p-10 ring-1 ring-white/10">
           <DialogHeader className="items-center text-center">
             <div className="size-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                <AlertCircle className="size-10" />
             </div>
             <DialogTitle className="text-3xl font-heading font-black tracking-tight">Verify Cancellation</DialogTitle>
             <p className="text-muted-foreground font-medium text-lg mt-2 px-4">The customer has requested to cancel this appointment. Please enter the verification code they provide.</p>
           </DialogHeader>
           
           <div className="mt-8 space-y-6">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={cancelCode[i] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val) {
                        const newCode = cancelCode.split('');
                        newCode[i] = val;
                        setCancelCode(newCode.join(''));
                        if (i < 5) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      } else {
                        const newCode = cancelCode.split('');
                        newCode[i] = '';
                        setCancelCode(newCode.join(''));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !cancelCode[i] && i > 0) {
                        (e.target.previousElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    className={`size-12 md:size-14 rounded-2xl bg-white dark:bg-black border-2 transition-all text-center text-2xl font-black outline-none focus:ring-4 focus:ring-primary/10 ${
                      pinError ? 'border-rose-500' : 'border-primary/20 focus:border-primary'
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                className="w-full h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-lg shadow-xl shadow-rose-500/20"
                onClick={handleVerifyCancellation}
                disabled={isVerifying || cancelCode.length !== 6}
              >
                {isVerifying ? <Loader2 className="size-5 animate-spin" /> : 'Confirm Cancellation'}
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full rounded-xl font-bold text-muted-foreground"
                onClick={() => { setShowCancelVerifyDialog(false); setCancelCode(''); setPinError(false); }}
              >
                Go Back
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Real-time Chat Drawer */}
      {selectedBooking && currentUser && (
        <ChatDrawer
          bookingId={selectedBooking._id}
          participantName={selectedBooking.user?.name || 'Customer'}
          isOpen={showChat}
          onOpenChange={setShowChat}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
