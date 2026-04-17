import { useState, useEffect } from 'react';
import API from '../../lib/api';
import { Loader2, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';

interface SlotPickerProps {
  slots: string[];
  availableSlots: string[];
  bookedSlots?: string[];
  disabledSlots?: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  loading?: boolean;
}

export function AppointmentSlotPicker({
  slots,
  availableSlots,
  selectedSlot,
  onSelect,
  loading
}: SlotPickerProps) {

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-48 space-y-4">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Calculating Available Windows...</p>
    </div>
  );

  if (!slots || slots.length === 0) return (
    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border/50 rounded-[3rem] opacity-50">
       <CalendarIcon className="size-8 mb-3" />
       <p className="text-sm font-black uppercase tracking-widest">No Operational Windows</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {slots.map((slot) => {
        const isAvailable = availableSlots.includes(slot);
        const isSelected = selectedSlot === slot;

        return (
          <button
            key={slot}
            type="button"
            disabled={!isAvailable}
            onClick={() => onSelect(slot)}
            className={`
              relative h-16 rounded-[1.25rem] font-black italic transition-all duration-700 border-2 overflow-hidden group
              ${isSelected 
                ? 'bg-primary border-primary text-white shadow-glow scale-[1.05] z-10' 
                : isAvailable 
                  ? 'bg-white/5 border-white/5 text-foreground hover:bg-primary/10 hover:border-primary/30' 
                  : 'bg-secondary/10 border-transparent text-muted-foreground/30 cursor-not-allowed opacity-20'
              }
            `}
          >
            {/* Hover Indicator */}
            {isAvailable && !isSelected && (
               <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="size-1 rounded-full bg-primary" />
               </div>
            )}
            
            <div className="flex flex-col items-center justify-center">
               <span className="text-sm tracking-tighter">{slot}</span>
            </div>

            {/* Selection checkmark */}
            {isSelected && (
               <div className="absolute top-1 right-1">
                  <div className="size-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
               </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
