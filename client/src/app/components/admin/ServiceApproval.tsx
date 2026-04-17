import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, DollarSign, MapPin, User, Loader2, ArrowUpRight, Search } from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export function ServiceApproval() {
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/pending-services');
      setPendingServices(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load pending services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const handleApprove = async (serviceId: string) => {
    try {
      await API.put(`/admin/approve-service/${serviceId}`);
      toast.success('Service authorized for marketplace!');
      fetchPendingServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      await API.put(`/admin/reject-service/${serviceId}`);
      toast.error('Service request declined.');
      fetchPendingServices();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-2"
      >
        <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Service Gatekeeper</h1>
        <p className="text-muted-foreground font-medium">Verify and authenticate provider service listings before they go live</p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Registry...</p>
        </div>
      ) : pendingServices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary/20 rounded-[2.5rem] border border-dashed py-32 text-center"
        >
          <div className="size-24 rounded-full bg-secondary flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">🛡️</div>
          <h2 className="text-3xl font-heading font-black mb-3">Registry Clear</h2>
          <p className="text-muted-foreground max-w-sm mx-auto font-medium">Excellent work! All pending service requests have been processed. The marketplace is up to date.</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {pendingServices.map((service) => (
              <motion.div
                key={service._id}
                variants={itemVariants}
                layout
                className="h-full"
              >
                <Card className="h-full flex flex-col group border bg-card/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/40 shadow-none hover:shadow-premium transition-all duration-500 rounded-[2.25rem] overflow-hidden">
                  {/* Yellow top accent for pending */}
                  <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 w-full animate-gradient-x" />
                  
                  <CardContent className="p-8 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 min-w-0 pr-4">
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 mb-3 px-3 py-1 font-bold rounded-lg pointer-events-none scale-90 -ml-1">
                          <Clock className="h-3 w-3 mr-1.5" /> Pending Authentication
                        </Badge>
                        <h3 className="text-2xl font-heading font-black tracking-tight leading-tight group-hover:text-primary transition-colors truncate">
                          {service.title}
                        </h3>
                      </div>
                      <div className="text-3xl font-heading font-black text-primary flex items-center shrink-0">
                        ₹{service.price}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground font-medium mb-8 line-clamp-3 flex-1 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Details Grid */}
                     <div className="grid grid-cols-2 gap-4 mb-4 p-6 bg-secondary/30 rounded-3xl border border-transparent group-hover:border-primary/5 transition-all">
                       <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Provider</p>
                         <div className="flex items-center gap-2 text-xs font-bold truncate">
                           <User className="size-3.5 text-primary" /> {service.provider?.name}
                         </div>
                       </div>
                       <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Zone</p>
                         <div className="flex items-center gap-2 text-xs font-bold">
                           <MapPin className="size-3.5 text-emerald-500" /> {service.location}
                         </div>
                       </div>
                     </div>

                     {(service.landmark || service.covered_areas?.length > 0) && (
                        <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                           {service.landmark && (
                              <div className="flex items-center justify-between text-[10px] font-bold">
                                 <span className="text-muted-foreground uppercase tracking-widest">Landmark</span>
                                 <span className="text-primary">{service.landmark} ({service.distance_from_landmark}km)</span>
                              </div>
                           )}
                           {service.covered_areas && service.covered_areas.length > 0 && (
                              <div className="space-y-1.5">
                                 <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em]">Service Localities</p>
                                 <div className="flex flex-wrap gap-1">
                                    {service.covered_areas.map((area: string, i: number) => (
                                       <span key={i} className="px-2 py-0.5 rounded-md bg-white border text-[8px] font-black uppercase">
                                          {area}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     )}

                    {/* Meta Footer */}
                    <div className="flex items-center justify-between mb-8 px-1">
                      <div className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                         <Search className="size-3.5" /> {service.category}
                      </div>
                      <div className="text-[10px] font-mono font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                        Reg: {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-auto">
                      <Button
                        size="lg"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl h-14 shadow-lg shadow-emerald-500/20"
                        onClick={() => handleApprove(service._id)}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Authorize
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="flex-1 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl h-14"
                        onClick={() => handleReject(service._id)}
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
