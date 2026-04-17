import { motion } from 'motion/react';
import { Check, Clock, Play, Trophy, XCircle } from 'lucide-react';

interface BookingStatusTrackerProps {
  status: string;
}

const statusMap: Record<string, number> = {
  'Pending': 0,
  'Accepted': 1,
  'In Progress': 2,
  'Completed': 3,
  'Rejected': -1
};

const steps = [
  { label: 'Pending', icon: Clock },
  { label: 'Accepted', icon: Check },
  { label: 'Active', icon: Play },
  { label: 'Done', icon: Trophy }
];

export function BookingStatusTracker({ status }: BookingStatusTrackerProps) {
  const currentIndex = statusMap[status] ?? 0;
  
  if (currentIndex === -1) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-xl text-destructive">
        <XCircle className="size-4" />
        <span className="text-xs font-black uppercase tracking-widest">Appointment Cancelled/Rejected</span>
      </div>
    );
  }

  const progressPercentage = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-[2px] bg-secondary dark:bg-gray-800" />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-5 left-0 h-[2px] bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center group">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.25 : 1,
                  backgroundColor: isCompleted || isActive ? 'var(--primary)' : 'var(--secondary)',
                  borderColor: isActive ? 'var(--primary)' : 'transparent',
                  rotate: isActive ? [0, -10, 10, 0] : 0
                }}
                transition={{
                   backgroundColor: { duration: 0.5 },
                   scale: { type: 'spring', stiffness: 300, damping: 15 },
                   rotate: isActive ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}
                }}
                className={`size-10 rounded-xl flex items-center justify-center border-2 transition-colors shadow-sm ${
                  isCompleted || isActive ? 'text-white' : 'text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                   <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                     <Check className="size-5" />
                   </motion.div>
                ) : (
                   <Icon className="size-5" />
                )}
                
                {isActive && (
                  <motion.div 
                    layoutId="pulse"
                    className="absolute inset-0 rounded-xl bg-primary/30"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </motion.div>
              
              <div className="absolute top-12 flex flex-col items-center whitespace-nowrap">
                <motion.span 
                  animate={{
                    color: isActive ? 'var(--primary)' : isPending ? 'rgba(var(--muted-foreground), 0.5)' : 'var(--muted-foreground)',
                    fontWeight: isActive ? 900 : 700,
                  }}
                  className={`text-[9px] uppercase tracking-widest transition-colors`}
                >
                  {step.label}
                </motion.span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
