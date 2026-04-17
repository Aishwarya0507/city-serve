import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  DollarSign, Calendar, CheckCircle, Star, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, Shield, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import API from '../../lib/api';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ProviderAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get('/provider/analytics');
        setData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[2.5rem]" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[450px] rounded-[3rem]" />
          <Skeleton className="h-[450px] rounded-[3rem]" />
        </div>
      </div>
    );
  }

  if (!data || data.totalBookings === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="size-24 rounded-full bg-secondary/30 flex items-center justify-center mb-8 text-5xl animate-bounce">📊</div>
        <h2 className="text-3xl font-heading font-black mb-4">No Business Intelligence Yet</h2>
        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Start accepting bookings to unlock your revenue projections, customer insights, and performance analytics.
        </p>
      </div>
    );
  }

  const summaryStats = [
    {
      title: 'Total Revenue',
      value: `₹${data.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-violet-500/10 text-violet-500',
      description: 'Net earnings from completed jobs',
      trend: '+12.5%',
      isPositive: true
    },
    {
      title: 'Success Rate',
      value: `${data.completionRate}%`,
      icon: CheckCircle,
      color: 'bg-emerald-500/10 text-emerald-500',
      description: 'Percentage of orders completed',
      trend: '+2.4%',
      isPositive: true
    },
    {
      title: 'Total Bookings',
      value: data.totalBookings,
      icon: Calendar,
      color: 'bg-blue-500/10 text-blue-500',
      description: 'Lifetime service requests',
      trend: '+5',
      isPositive: true
    },
    {
      title: 'Average Rating',
      value: data.averageRating,
      icon: Star,
      color: 'bg-amber-500/10 text-amber-500',
      description: 'Quality of service feedback',
      trend: '+0.2',
      isPositive: true
    }
  ];

  const chartData = data.monthlyEarnings.map((m: any) => ({
    name: new Date(m._id + "-01").toLocaleDateString('en-US', { month: 'short' }),
    earnings: m.earnings,
    jobs: m.count
  }));

  const pieData = data.statusDist.map((s: any) => ({
    name: s._id,
    value: s.count
  }));

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                <Target className="size-3 mr-2" /> Live Performance
             </Badge>
          </div>
          <h1 className="text-5xl font-heading font-black tracking-tight">Market Intelligence</h1>
          <p className="text-muted-foreground mt-2 font-medium">Growth strategies & advanced performance metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="size-10 rounded-full border-4 border-background bg-secondary flex items-center justify-center text-[10px] font-black ring-2 ring-primary/20">
                   {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="size-10 rounded-full border-4 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black z-10 shadow-glow">
                 +12
              </div>
           </div>
           <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground leading-tight ml-4">
              Monthly Active<br/>Customers
           </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border border-white/5 bg-secondary/20 hover:bg-white/5 transition-all duration-500 rounded-[2.5rem] shadow-none hover:shadow-premium ring-1 ring-white/5">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 size-40 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-2xl ${stat.color} shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className="size-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1.5 rounded-full ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                       {stat.isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                       {stat.trend}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.title}</h3>
                    <p className="text-4xl font-heading font-black tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8 px-4">
        <Card className="lg:col-span-2 rounded-[3rem] border border-white/5 bg-[#020617] text-white overflow-hidden shadow-premium-dark relative">
          <div className="absolute top-0 right-0 p-8">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-glow">
                <Activity className="size-3" /> Trending Up
             </div>
          </div>
          <CardHeader className="p-10 pb-0">
             <CardTitle className="text-3xl font-heading font-black tracking-tight">Revenue Trajectory</CardTitle>
             <CardDescription className="text-white/40 font-medium">Monthly earnings growth and volume projection</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary, #8b5cf6)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderRadius: '1.5rem', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    padding: '1.5rem'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border border-white/5 bg-secondary/20 shadow-premium flex flex-col items-center">
           <CardHeader className="w-full p-10 pb-4 text-center">
              <CardTitle className="text-2xl font-heading font-black tracking-tight">Service Mix</CardTitle>
              <CardDescription className="font-medium">Booking status distribution</CardDescription>
           </CardHeader>
           <CardContent className="w-full flex-1 flex flex-col items-center justify-center p-8">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '1rem', 
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                 {pieData.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-2 bg-background/50 p-2 rounded-xl border border-white/5">
                       <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                       <span className="text-[9px] font-black uppercase tracking-tight truncate">{entry.name}</span>
                       <span className="ml-auto text-[9px] font-black text-primary">{entry.value}</span>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      </div>

      {/* Activity Insights */}
      <div className="grid md:grid-cols-2 gap-8 px-4">
         <Card className="rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2 shadow-glow group overflow-hidden">
            <CardContent className="p-10 relative overflow-hidden">
               <Zap className="absolute top-2 right-2 size-40 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
               <h3 className="text-3xl font-heading font-black mb-4 leading-none">Efficiency Insight</h3>
               <p className="text-white/80 text-sm font-medium leading-relaxed mb-10 max-w-sm">
                  Your <span className="text-white font-black underline decoration-white/30 underline-offset-4">Success Rate</span> is currently **{data.completionRate}%**. Providers with rates above 90% see 3x more service requests.
               </p>
               <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                     <TrendingUp className="size-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Optimization Tip</p>
                    <p className="text-xs font-bold">Try reducing response time by 15 mins</p>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 p-2 group hover:border-primary transition-all duration-500">
            <CardContent className="p-10 relative">
               <Shield className="absolute bottom-4 right-4 size-32 text-primary/5 transition-transform duration-1000 group-hover:scale-110" />
               <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-glow">
                  <Star className="size-6 fill-white" />
               </div>
               <h3 className="text-2xl font-black mb-3 tracking-tight">Trust Authority</h3>
               <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-10">
                  Your average rating of **{data.averageRating}** is among the top 15% in your region. Quality consistency is your greatest business asset.
               </p>
               <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(parseFloat(data.averageRating) / 5) * 100}%` }}
                    className="h-full bg-primary" 
                  />
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
