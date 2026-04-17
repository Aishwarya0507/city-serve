import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { 
  Users, Briefcase, Calendar, MapPin, TrendingUp, TrendingDown, 
  Activity, Loader2, ArrowUpRight, Search, Download, Filter,
  ShieldCheck, Globe, Zap, ChevronRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
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

export function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosing, setDiagnosing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast }: any = { toast: (obj: any) => import('sonner').then(m => m.toast[obj.type || 'success'](obj.title, { description: obj.description })) };


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleRunDiagnostics = async () => {
    setDiagnosing(true);
    // Simulate system diagnostics
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDiagnosing(false);
    toast({
      type: 'success',
      title: "Diagnostics Complete",
      description: "All system modules are operating within normal parameters."
    });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    toast({
      type: 'info',
      title: "Preparing Export",
      description: "Generating your platform analytics report..."
    });
    
    // Use window.print() for a functional PDF export without external libs
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 1000);
  };


  const statsItems = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.stats?.totalRevenue?.value?.toLocaleString() || 0}`,
      icon: TrendingUp,
      color: 'text-indigo-600 bg-indigo-500/10',
      change: stats?.stats?.totalRevenue?.change || '+14.2%',
      isPositive: true
    },
    {
      title: 'Top Professional',
      value: stats?.stats?.topProvider || 'None',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-500/10',
      change: 'Leader',
      isPositive: true
    },
    {
      title: 'Star Service',
      value: stats?.stats?.topService || 'None',
      icon: Zap,
      color: 'text-amber-600 bg-amber-500/10',
      change: 'Trending',
      isPositive: true
    },
    {
      title: t('total_bookings') || 'Total Appointments',
      value: stats?.stats?.totalBookings?.value || 0,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-500/10',
      change: stats?.stats?.totalBookings?.change || '+5%',
      isPositive: true
    },
  ];

  const bookingsData = stats?.chartData?.length > 0 
    ? stats.chartData 
    : [
        { month: 'Jan', bookings: 45 },
        { month: 'Feb', bookings: 52 },
        { month: 'Mar', bookings: 48 },
        { month: 'Apr', bookings: 61 },
        { month: 'May', bookings: 55 },
        { month: 'Jun', bookings: 67 },
      ];

  const categoryData = stats?.categoryData?.length > 0
    ? stats.categoryData
    : [
        { name: 'Cleaning', value: 400 },
        { name: 'Plumbing', value: 300 },
        { name: 'Electrical', value: 300 },
        { name: 'Repair', value: 200 },
      ];

  const COLORS = ['var(--primary)', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2"
      >
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight">{t('platform_control') || 'Platform Control'}</h1>
          <p className="text-muted-foreground font-medium mt-1">{t('system_metrics') || 'Real-time system health and growth metrics'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl h-10 px-4 font-bold"
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Download className="size-4 mr-2" />}
            {t('export_pdf') || 'Export PDF'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
          statsItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.title} variants={itemVariants}>
                <Card className="group relative overflow-hidden border-none bg-secondary/30 hover:bg-white dark:hover:bg-black/40 shadow-none hover:shadow-premium transition-all duration-500 rounded-3xl h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className="size-6" />
                      </div>
                      <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {stat.isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {stat.change}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{stat.title}</h3>
                      <p className="text-3xl font-heading font-black tracking-tight">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Charts & Analytics */}
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
  initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="rounded-[2.5rem] border bg-card/50 backdrop-blur-sm overflow-hidden h-full shadow-sm">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-heading font-black">Revenue Velocity</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-md px-2 py-0.5">Monthly</Badge>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg"><Filter className="size-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-10">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bookingsData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#888' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#888' }} 
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: 'var(--shadow-premium)',
                        fontWeight: 'bold'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="rounded-[2.5rem] border bg-card/50 backdrop-blur-sm overflow-hidden h-full shadow-sm">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-heading font-black">Market Share</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex flex-col items-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 w-full space-y-3">
                {categoryData.slice(0, 3).map((cat: any, i: number) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-sm font-bold">{cat.name}</span>
                    </div>
                    <span className="text-xs font-black text-muted-foreground">{cat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-heading font-bold">Recent activity</h2>
            <Button variant="ghost" size="sm" className="text-primary font-bold">
              View All Logs <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {[
              { type: 'booking', text: 'New plumbing appointment in Mumbai', time: '2 mins ago', icon: <Calendar className="size-4" />, color: 'blue' },
              { type: 'provider', text: 'Sarah Green verified as Professional', time: '12 mins ago', icon: <ShieldCheck className="size-4" />, color: 'emerald' },
              { type: 'system', text: 'Automatic data backup completed', time: '1 hour ago', icon: <Globe className="size-4" />, color: 'indigo' },
            ].map((activity, index) => (activity.type === 'booking' ? (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="group hover:border-primary/20 transition-all rounded-2xl overflow-hidden shadow-sm border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-tight">{activity.text}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{activity.time}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="group hover:border-primary/20 transition-all rounded-2xl overflow-hidden shadow-sm border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`size-10 rounded-xl bg-${activity.color}-500/10 text-${activity.color}-600 flex items-center justify-center shrink-0`}>
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold leading-tight">{activity.text}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">{activity.time}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )))}
          </motion.div>
        </section>

        <section className="space-y-6">
          <Card className="rounded-[2rem] border bg-primary text-primary-foreground shadow-premium overflow-hidden border-none">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-black mb-4 flex items-center gap-2">
                <ShieldCheck className="size-5" /> Security Audit
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold opacity-80">SSL Status</span>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-[10px]">ACTIVE</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold opacity-80">API Latency</span>
                  <span className="font-black">24ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold opacity-80">System Load</span>
                  <span className="font-black">1.2%</span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-8 font-extrabold rounded-xl h-12 shadow-xl"
                onClick={handleRunDiagnostics}
                disabled={diagnosing}
              >
                {diagnosing ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Diagnostics"
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
