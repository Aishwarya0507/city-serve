import * as React from "react";
import { useState, useEffect } from "react";
import { Calendar } from "./calendar";
import { cn } from "./utils";
import API from "../../lib/api";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { Loader2, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AvailabilityCalendarProps {
  providerId: string;
  serviceId: string;
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

interface DayStatus {
  date: string;
  status: 'available' | 'fully_booked' | 'unavailable' | 'past';
  slotsCount?: number;
  firstSlot?: string;
}

export function AvailabilityCalendar({
  providerId,
  serviceId,
  selectedDate,
  onSelect,
  className
}: AvailabilityCalendarProps) {
  const [monthData, setMonthData] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const fetchMonthAvailability = async (date: Date) => {
    setLoading(true);
    try {
      const monthStr = format(date, 'yyyy-MM');
      // Corrected URL to match new backend route: /api/availability/month/:providerId/:serviceId/:month
      const { data } = await API.get(`/availability/month/${providerId}/${serviceId}/${monthStr}`);
      setMonthData(data);
    } catch (error) {
      console.error("Error fetching monthly availability:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId && serviceId) {
      fetchMonthAvailability(currentMonth);
    }
  }, [providerId, serviceId, currentMonth]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return monthData.find(d => d.date === dateStr);
  };

  const nextAvailable = monthData.find(d => d.status === 'available');

  return (
    <div className={cn("space-y-6", className)}>
      <AnimatePresence>
        {nextAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-emerald-500/15 transition-all shadow-glow"
            onClick={() => onSelect(new Date(nextAvailable.date))}
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CalendarIcon className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Next Available Slot</p>
                <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">
                  {format(new Date(nextAvailable.date), 'EEEE, MMM do')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg border border-emerald-500/10">
               <Clock className="size-3.5 text-emerald-600" />
               <span className="text-xs font-black text-emerald-700">{nextAvailable.firstSlot || 'Anytime'}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-white/5 dark:bg-[#0b0c15] p-6 rounded-[3rem] border border-white/5 shadow-2xl ring-1 ring-white/10">
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card/40 backdrop-blur-[2px] rounded-[3rem]">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          onMonthChange={setCurrentMonth}
          disabled={(date) => {
            const status = getDayStatus(date);
            return (
              date < new Date(new Date().setHours(0,0,0,0)) ||
              !status ||
              status.status !== 'available'
            );
          }}
          className="rounded-md"
          components={{
            DayContent: ({ date, ...props }) => {
              const status = getDayStatus(date);
              const isPast = date < new Date(new Date().setHours(0,0,0,0));
              
              return (
                <div className="relative flex flex-col items-center justify-center w-full h-full pt-1">
                  <span className={cn(
                    "text-sm font-black z-10 transition-colors uppercase",
                    isPast ? "text-muted-foreground/20" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {!isPast && status && (
                    <div className={cn(
                      "absolute bottom-0.5 size-1 rounded-full transition-all",
                      status.status === 'available' && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
                      status.status === 'fully_booked' && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
                      status.status === 'unavailable' && "bg-slate-400 opacity-40"
                    )} />
                  )}
                </div>
              );
            }
          }}
        />

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Available</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">Fully Booked</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-2 rounded-full bg-slate-400 opacity-40 whitespace-nowrap" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">No Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
