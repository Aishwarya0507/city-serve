import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, XCircle, Mail, Phone, Briefcase, Calendar, Loader2, ArrowUpRight } from 'lucide-react';
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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function ProviderApproval() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      const { data } = await API.get('/admin/pending-providers');
      setProviders(data);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleUpdateStatus = async (providerId: string, status: string) => {
    try {
      await API.put(`/admin/approve-provider/${providerId}`, { status });
      toast.success(`Provider ${status} successfully!`);
      fetchProviders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const ProviderCard = ({ provider }: { provider: any }) => (
    <Card className="group hover:shadow-premium transition-all duration-500 rounded-[2rem] border bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <Badge
                className={`rounded-lg px-3 py-1 font-bold ${
                  provider.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : provider.status === 'pending'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
              </Badge>
              <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest">
                ID: #{provider._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <h3 className="text-2xl font-heading font-black tracking-tight mb-4 group-hover:text-primary transition-colors">
              {provider.name}
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground font-bold">
                <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="truncate">{provider.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-bold">
                <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>{provider.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-bold">
                <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <span>{provider.business_name || 'Individual'}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-bold">
                <div className="p-1.5 rounded-lg bg-primary/5 text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <span>Joined {new Date(provider.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {provider.status === 'pending' && (
            <div className="flex gap-3 lg:flex-col lg:w-48 border-t lg:border-t-0 lg:border-l pt-6 lg:pt-0 lg:pl-8">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl h-12 shadow-lg shadow-emerald-500/20"
                onClick={() => handleUpdateStatus(provider._id, 'approved')}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-rose-600 hover:bg-rose-500/10 font-bold rounded-xl h-12"
                onClick={() => handleUpdateStatus(provider._id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 pb-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-2"
      >
        <h1 className="text-4xl font-heading font-black tracking-tight mb-2">Provider Onboarding</h1>
        <p className="text-muted-foreground font-medium">Verify and approve new service provider applications</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList className="bg-secondary/40 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto h-auto">
            <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm transition-all">All Records</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm transition-all text-amber-600">Pending Approvals</TabsTrigger>
            <TabsTrigger value="approved" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm transition-all text-emerald-600">Approved Pros</TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black shadow-sm transition-all text-rose-600">Archive</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
             {providers.filter(p => p.status === 'pending').length === 0 ? (
               <div className="bg-secondary/20 rounded-[2.5rem] border border-dashed py-24 text-center">
                 <div className="size-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 text-3xl">📭</div>
                 <h3 className="text-2xl font-bold mb-2">Queue is Empty</h3>
                 <p className="text-muted-foreground max-w-sm mx-auto">No pending provider applications at the moment. You'll be notified when new pros join.</p>
               </div>
             ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  {providers.filter(p => p.status === 'pending').map((provider) => (
                    <motion.div key={provider._id} variants={itemVariants}>
                      <ProviderCard provider={provider} />
                    </motion.div>
                  ))}
                </motion.div>
             )}
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
             <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {providers.map((provider) => (
                  <motion.div key={provider._id} variants={itemVariants}>
                    <ProviderCard provider={provider} />
                  </motion.div>
                ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
