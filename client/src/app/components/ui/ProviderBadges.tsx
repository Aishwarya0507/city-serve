import { Badge } from './badge';
import { Star, ShieldCheck, Zap } from 'lucide-react';

interface ProviderBadgesProps {
  service: any;
  className?: string;
}

export function ProviderBadges({ service, className = "" }: ProviderBadgesProps) {
  const isTopRated = service.averageRating >= 4.5;
  const isVerified = service.provider?.providerDetails?.isVerified;
  
  // Deterministic mock for "Fast Response"
  const isFastResponse = service._id ? (parseInt(service._id.slice(-1), 16) % 3 === 0) : false;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      
      {isTopRated && (
        <Badge variant="warning" className="h-5 px-1.5 rounded-md border-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[9px] uppercase tracking-tighter flex items-center gap-1 shrink-0">
          <Star className="size-2.5 fill-amber-500" /> Top Rated
        </Badge>
      )}

      {isFastResponse && (
        <Badge variant="secondary" className="h-5 px-1.5 rounded-md border-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-[9px] uppercase tracking-tighter flex items-center gap-1 shrink-0">
          <Zap className="size-2.5 fill-blue-500" /> Fast Response
        </Badge>
      )}
    </div>
  );
}
