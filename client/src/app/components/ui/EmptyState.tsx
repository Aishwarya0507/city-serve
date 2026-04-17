import { motion } from 'motion/react';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  emoji,
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center justify-center p-12 py-24 text-center bg-card/40 backdrop-blur-xl border border-dashed border-border/50 rounded-[3rem] ${className}`}
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-50" />
        <div className="relative size-24 rounded-[2rem] bg-secondary/50 flex items-center justify-center border shadow-inner">
          {Icon ? (
             <Icon className="size-10 text-primary" />
          ) : (
             <span className="text-4xl">{emoji || '✨'}</span>
          )}
        </div>
      </div>

      <h3 className="text-3xl font-heading font-black tracking-tight mb-3">
        {title}
      </h3>
      
      <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-lg font-medium leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="rounded-2xl h-14 px-10 font-black text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
