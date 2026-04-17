import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Button } from './button';
import { Label } from './label';
import { Calendar as CalendarContainer } from './calendar';
import { Calendar as CalendarIcon, Clock, AlertCircle, Loader2, Send, ChevronRight, ChevronLeft } from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface RescheduleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSuccess: () => void;
}

export function RescheduleModal({ isOpen, onOpenChange, booking, onSuccess }: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  const fetchSlots = async (date: Date) => {
    if (!booking?.service?._id && !booking?.service) return;
    const serviceId = booking.service._id || booking.service;
    const providerId = booking.provider._id || booking.provider;
    const dateStr = format(date, 'yyyy-MM-dd');
    
    setFetchingSlots(true);
    try {
      const { data } = await API.get(`/availability/${providerId}/${serviceId}/${dateStr}`);
      if (data.available) {
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAvailableSlots([]);
        toast.error(data.message || 'Provider unavailable on this date');
      }
    } catch (error) {
      setAvailableSlots([]);
    } finally {
      setFetchingSlots(false);
    }
  };

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedSlot) return toast.error('Please select both date and time');
    
    try {
      setLoading(true);
      await API.post(`/bookings/${booking._id}/reschedule`, {
        newDate: format(selectedDate, 'yyyy-MM-dd'),
        newTimeSlot: selectedSlot,
        reason
      });
      toast.success('Reschedule request sent to professional');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-[#020617] border-white/5 shadow-2xl rounded-[3rem] p-0 overflow-hidden ring-1 ring-white/10">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Calendar Picker */}
          <div className="p-8 bg-white/2 md:border-r border-white/5 md:w-[350px]">
             <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center">
                   <CalendarIcon className="size-5" />
                </div>
                <div>
                   <h3 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">Select Date</h3>
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">Calibrate Timeline</p>
                </div>
             </div>
             <CalendarContainer
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d && !isBefore(d, startOfDay(new Date()))) {
                    setSelectedDate(d);
                    setSelectedSlot('');
                  }
                }}
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                className="rounded-3xl border-transparent scale-105"
             />
          </div>

          {/* Right: Slot Picker & Action */}
          <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
             <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                         <Clock className="size-5" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">Select Slot</h3>
                         <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mt-1">
                           {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'No date selected'}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                   {fetchingSlots ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                         <Loader2 className="size-8 animate-spin" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Querying System...</span>
                      </div>
                   ) : availableSlots.length === 0 ? (
                      <div className="h-full border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center opacity-10">
                         <AlertCircle className="size-10 mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest leading-none text-center px-6">Professional Unavailable <br /> on this day</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 gap-3 pb-4">
                         {availableSlots.map(slot => (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`h-12 rounded-2xl text-[11px] font-black transition-all border-2 ${selectedSlot === slot ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.05]' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                            >
                              {slot}
                            </button>
                         ))}
                      </div>
                   )}
                </div>
             </div>

             <div className="space-y-4">
                <button
                   disabled={!selectedSlot || loading}
                   onClick={handleSubmit}
                   className="w-full h-20 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-black transition-all duration-700 shadow-3xl flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale"
                >
                   {loading ? <Loader2 className="animate-spin size-6" /> : (
                      <>
                        Propose Change <Send className="size-4" />
                      </>
                   )}
                </button>
                <p className="text-[9px] font-black text-center text-slate-500 uppercase tracking-widest opacity-60">
                   Requires Professional Confirmation
                </p>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
