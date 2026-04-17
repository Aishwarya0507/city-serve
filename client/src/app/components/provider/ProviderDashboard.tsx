import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  Calendar, CheckCircle, Clock, DollarSign, TrendingUp, TrendingDown, 
  Loader2, Star, ChevronRight, Activity, ArrowUpRight, MapPin
} from 'lucide-react';
import API from '../../lib/api';
import { useTranslation } from 'react-i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function ProviderDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/provider');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching provider bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthBookings = bookings.filter(b => new Date(b.createdAt) >= firstDayOfMonth);
  const prevMonthBookings = bookings.filter(b => {
    const d = new Date(b.createdAt);
    return d >= firstDayOfPrevMonth && d < firstDayOfMonth;
  });

  const currentRevenue = currentMonthBookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);
  const prevRevenue = prevMonthBookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => sum + (b.service?.price || 0), 0);

  const stats = [
    {
      title: 'Total Appointments',
      value: bookings.length,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-500/10',
      change: calculateGrowth(currentMonthBookings.length, prevMonthBookings.length),
      isPositive: currentMonthBookings.length >= prevMonthBookings.length
    },
    {
      title: 'Success Rate',
      value: `${((bookings.filter(b => b.status === 'Completed').length / (bookings.length || 1)) * 100).toFixed(0)}%`,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-500/10',
      change: 'Calculated',
      isPositive: true
    },
    {
      title: 'Active Orders',
      value: bookings.filter(b => ['Pending', 'In Progress'].includes(b.status)).length,
      icon: Activity,
      color: 'text-amber-600 bg-amber-500/10',
      change: 'Standard',
      isPositive: true
    },
    {
      title: 'Revenue',
      value: `₹${bookings.filter(b => b.status === 'Completed').reduce((sum, b) => sum + (b.service?.price || 0), 0)}`,
      icon: DollarSign,
      color: 'text-indigo-600 bg-indigo-500/10',
      change: calculateGrowth(currentRevenue, prevRevenue),
      isPositive: currentRevenue >= prevRevenue
    },
    {
      title: 'Avg Rating',
      value: (bookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / (bookings.filter(b => b.rating).length || 1)).toFixed(1),
      icon: Star,
      color: 'text-yellow-600 bg-yellow-500/10',
      change: 'Lifetime',
      isPositive: true
    },
  ];

  const recentBookings = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const statusConfig: Record<string, any> = {
    Completed: 'success',
    Pending: 'warning',
    'In Progress': 'pulse',
    Rejected: 'destructive'
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header - 10x Elevation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 py-8 rounded-[3rem] bg-[#020617] border border-white/5 shadow-premium-dark relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 size-60 bg-primary/10 rounded-full blur-[80px] animate-pulse-soft" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Business Command Center</span>
          </div>
          <h1 className="text-5xl font-heading font-black tracking-tighter text-white">{t('market_intelligence') || 'Market Intelligence'}</h1>
          <p className="text-white/40 font-medium mt-1">{t('business_analytics_desc') || 'Real-time performance analytics & business growth'}</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3 text-sm font-black text-white shadow-2xl">
            <Calendar className="size-5 text-primary" />
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button variant="premium" className="h-14 px-8 rounded-2xl font-black text-sm shadow-glow" onClick={() => navigate('/provider/services')}>
            {t('add_new_service') || 'Add New Service'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid - 10x Elevation */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <Card className="group relative overflow-hidden border border-white/5 bg-secondary/20 hover:bg-primary/5 shadow-none hover:shadow-premium-dark transition-all duration-700 rounded-[2.5rem] h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <CardContent className="p-8 relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`p-4 rounded-2xl border border-white/5 bg-white/5 group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl`}>
                      <Icon className="size-7" />
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                      {stat.isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.title}</h3>
                    <p className="text-4xl font-heading font-black tracking-tight text-white">{stat.value}</p>
                  </div>
                </CardContent>
                
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500">
                   <ArrowUpRight className="size-5 text-primary" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-8 px-2">
             <h2 className="text-2xl font-heading font-black tracking-tight">{t('appointment_queue') || 'Appointment Queue'}</h2>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">
                   Today
                </Button>
                <Button variant="ghost" size="sm" className="rounded-xl font-bold h-9 text-primary" onClick={() => navigate('/provider/bookings')}>
                   Manage All <ChevronRight className="size-4 ml-1" />
                </Button>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-3xl" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <Card className="border-dashed bg-transparent rounded-[2.5rem]">
                <CardContent className="p-16 text-center">
                  <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
                  <p className="font-bold mb-1">Queue Empty</p>
                  <p className="text-sm text-muted-foreground font-medium">No appointments scheduled for today yet.</p>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {recentBookings.map((booking) => (
                  <motion.div key={booking._id} variants={itemVariants}>
                    <Card className="group hover:border-primary/40 transition-all duration-700 rounded-[2.5rem] overflow-hidden shadow-sm border border-white/5 bg-[#020617]/40 backdrop-blur-xl">
                      <CardContent className="p-8">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            <div className="size-16 rounded-[1.5rem] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-2xl shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-glow">
                               {booking.user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                                  {booking.service?.title || 'Appointment'}
                                </h3>
                                <Badge variant={statusConfig[booking.status] || 'default'} className="rounded-xl h-6 px-3 flex items-center gap-2 font-black text-[10px] uppercase tracking-widest border-none">
                                  {booking.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
                                <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg"><Clock className="size-3.5 text-primary" /> {new Date(booking.date).toLocaleDateString()}</span>
                                <span className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg"><MapPin className="size-3.5 text-primary" /> {booking.user?.name}</span>
                                {booking.rating && (
                                  <span className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    <Star className="size-3.5 fill-yellow-500" /> {booking.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-3xl font-heading font-black text-primary drop-shadow-sm">₹{booking.service?.price}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">Net Earnings</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Sidebar / Quick Actions */}
        <section className="space-y-8">
           <Card className="bg-[#020617] text-white rounded-[3rem] overflow-hidden relative shadow-premium-dark border border-white/5 group h-fit">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
            <CardContent className="p-10 relative z-10">
              <div className="size-14 rounded-[1.2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-10 shadow-glow">
                <Star className="size-7 text-primary fill-primary" />
              </div>
              <h3 className="text-3xl font-heading font-black mb-4 leading-none">Excellence Score</h3>
              <p className="text-white/40 text-sm mb-10 font-medium leading-relaxed">
                Maintain a rating above 4.5 to stay featured and earn the <span className="text-primary font-black">Elite Provider</span> badge.
              </p>
              <div className="flex items-center gap-5 mb-10">
                <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full shadow-glow" 
                  />
                </div>
                <span className="font-black text-sm tracking-widest">85%</span>
              </div>
              <Button variant="premium" className="w-full font-black rounded-2xl h-14 shadow-glow group-hover:scale-[1.02] transition-transform">
                Optimize Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border border-white/5 bg-[#020617]/40 backdrop-blur-xl text-white shadow-premium-dark overflow-hidden group">
            <CardContent className="p-10 relative">
              <Activity className="absolute bottom-4 right-4 size-32 text-white/5 -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
              <div className="size-14 rounded-[1.2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8">
                <TrendingUp className="size-7 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight leading-none">Growth Potential</h3>
              <p className="text-white/40 text-sm font-medium leading-relaxed mb-10">Expand your reach to 2 new locations and double your revenue pipeline.</p>
              <Button variant="outline" className="font-black rounded-2xl h-14 w-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all uppercase tracking-widest text-[10px]" onClick={() => navigate('/provider/services')}>
                Scale Business
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
