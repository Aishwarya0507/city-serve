import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  MapPin, Clock, Star, ChevronRight, Search, Zap, Droplets, LayoutGrid, RotateCcw, Trash2, ArrowRight, Sparkles, Navigation2
} from "lucide-react";
import API from "../../lib/api";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";

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
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
};

export function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [localServices, setLocalServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { recentViewed, clearHistory } = useRecentlyViewed();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Profile
        const { data: profile } = await API.get("/auth/profile");
        setUser(profile);
        
        // 2. Fetch everything else
        const [bookRes, catRes] = await Promise.all([
          API.get("/bookings"),
          API.get("/categories/all")
        ]);

        // 3. Fetch services matching user location - using Query Params
        const locParams = new URLSearchParams();
        if (profile.village) locParams.append("village", profile.village);
        if (profile.district) locParams.append("district", profile.district);
        if (profile.state) locParams.append("state", profile.state);
        
        const { data: services } = await API.get(`/services?${locParams.toString()}`);
        setLocalServices(services.slice(0, 4));

        setCategories(catRes.data);
        const upcoming = bookRes.data
          .filter((b: any) => ["Pending", "Accepted", "In Progress"].includes(b.status))
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRecentBookings(upcoming.slice(0, 3));

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (category: any) => {
     navigate(`/customer/services?jumpTo=subservices&categoryId=${category._id}&categoryName=${encodeURIComponent(category.name)}`);
  };

  return (
    <div className="space-y-16 pb-32">
      {/* Personalized Hero */}
      <section className="relative min-h-[600px] flex items-center px-10 rounded-[4rem] bg-[#020617] border border-white/5 shadow-premium-dark overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 size-[700px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-soft opacity-60" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 size-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-40" />
        
        <div className="relative z-10 max-w-4xl py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-3xl mb-10">
            <div className="size-2 bg-indigo-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
               <Navigation2 className="size-3 text-indigo-400" /> Professional Hub: {user?.village || user?.district || user?.state || "Universal"}
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-heading font-black tracking-tighter mb-10 text-white leading-[0.85]">
            Hello, {user?.name?.split(" ")[0]} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-400 italic">Ready to Serve.</span>
          </h1>
          
          <p className="text-2xl text-white/40 mb-14 max-w-2xl font-medium leading-relaxed italic">
            Synchronized with <span className="text-white/60">{user?.village || user?.district || "your region"}</span>. Discover local mastery below.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Button className="h-20 px-12 rounded-3xl font-black text-lg bg-indigo-600 hover:bg-white hover:text-black shadow-glow transition-all duration-700" onClick={() => navigate("/customer/services")}>
              <Search className="size-5 mr-3" /> Explore All Services
            </Button>
            <div className="flex items-center gap-4 px-8 h-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-xl group/loc hover:border-indigo-600/30 transition-all cursor-pointer" onClick={() => navigate("/customer/settings")}>
               <div className="size-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 group-hover/loc:bg-indigo-600 group-hover/loc:text-white transition-all">
                  <MapPin className="size-5" />
               </div>
               <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Service Hub</p>
                  <p className="text-sm font-black text-white italic">{user?.village || user?.district || "Global"}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
           <div className="relative size-96">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-[40px] border-indigo-600/5 rounded-full" />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-10 border-[20px] border-blue-600/5 rounded-full border-dashed" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="size-20 text-indigo-600/20" />
              </div>
           </div>
        </div>
      </section>

      {/* Local Professionals */}
      <section className="space-y-10 px-2">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-3xl font-black italic tracking-tighter text-white">Local Mastery</h2>
               <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Verified Experts in {user?.district || user?.village || "Your Vicinity"}</p>
            </div>
            <Button variant="ghost" className="text-indigo-400 font-black uppercase text-[10px] tracking-widest" onClick={() => navigate("/customer/services")}>Expand Search <ChevronRight className="size-4 ml-2" /></Button>
         </div>
         
         {localServices.length === 0 ? (
            <div className="py-20 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/5">
               <Navigation2 className="size-16 mx-auto mb-6 text-slate-800" />
               <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No local experts detected in {user?.village || user?.district || "your region"} yet</p>
            </div>
         ) : (
            <div className="grid md:grid-cols-4 gap-8">
               {localServices.map((service) => (
                  <Card key={service._id} className="bg-[#0d0e1b] border-white/5 hover:border-indigo-600/30 rounded-[3rem] overflow-hidden group cursor-pointer transition-all duration-700 border-2" onClick={() => navigate(`/customer/book/${service._id}`)}>
                     <div className="relative aspect-square overflow-hidden">
                        <img src={service.image ? `http://localhost:5000${service.image}` : "https://via.placeholder.com/400x400"} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1b] to-transparent opacity-60" />
                        <div className="absolute top-6 right-6">
                           <Badge className="bg-white/10 backdrop-blur-2xl text-white font-black rounded-xl text-[9px] uppercase tracking-widest border-white/10">₹{service.price}</Badge>
                        </div>
                     </div>
                     <CardContent className="p-8">
                        <h4 className="font-black text-white italic truncate mb-2">{service.title}</h4>
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Star className="size-3.5 fill-current" />
                           <span className="text-[11px] font-black">{service.averageRating || 4.8} Registry Rating</span>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         )}
      </section>

      {/* Discovery Pillars */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
           <div>
              <h2 className="text-3xl font-black tracking-tighter italic text-white mb-2">Service Pillars</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Universal Resource Taxonomy</p>
           </div>
           <Button variant="ghost" className="text-indigo-400 font-black tracking-widest text-xs uppercase" onClick={() => navigate("/customer/services")}>
              Discovery Compass <ChevronRight className="size-4 ml-2" />
           </Button>
        </div>

        {loading ? (
           <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-56 rounded-[3rem] bg-indigo-600/5" />)}
           </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-5 gap-8">
            {categories.map((category) => (
              <motion.div key={category._id} variants={itemVariants}>
                <Card
                  className="group relative cursor-pointer border-white/5 bg-[#0d0e1b] hover:bg-indigo-600 shadow-none transition-all duration-700 rounded-[3rem] overflow-hidden border-2"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardContent className="p-10 text-center flex flex-col items-center justify-center min-h-[220px]">
                    <div className="mb-6 size-20 rounded-[1.5rem] bg-white/5 flex items-center justify-center mx-auto group-hover:bg-white group-hover:scale-110 transition-all duration-700 overflow-hidden border border-white/5">
                      {category.image ? (
                        <img src={`http://localhost:5000${category.image}`} alt={category.name} className="w-full h-full object-cover" />
                      ) : (
                        <LayoutGrid className="size-8 text-indigo-500" />
                      )}
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-white transition-colors">{category.name}</h3>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <ArrowRight className="size-4 text-white animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Summary Timeline */}
      <section className="bg-white/5 rounded-[4rem] p-16 border border-white/10 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-600/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-14 relative z-10">
           <div>
              <h2 className="text-4xl font-black text-white italic tracking-tighter">Active Protocol</h2>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Personal Service Timeline</p>
           </div>
           <Button className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white hover:text-black text-white font-black uppercase text-[10px] tracking-widest transition-all duration-500" onClick={() => navigate("/customer/bookings")}>Registry Overview</Button>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-3 gap-10"><Skeleton className="h-40 rounded-[2.5rem] bg-indigo-600/5" /></div>
        ) : recentBookings.length === 0 ? (
          <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] bg-black/20">
             <div className="size-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">🗓️</div>
             <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-[9px]">Professional timeline currently clear</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {recentBookings.map((booking) => (
              <Card key={booking._id} className="bg-[#0d0e1b] border-white/5 hover:border-indigo-600/30 rounded-[2.5rem] p-10 transition-all duration-700 group border-2">
                <div className="flex items-center gap-6 mb-10">
                  <div className="size-16 rounded-[1.5rem] bg-indigo-600 flex flex-col items-center justify-center text-white shrink-0 shadow-2xl shadow-indigo-600/40 border border-white/20 group-hover:scale-110 transition-transform duration-700">
                    <span className="text-[9px] font-black uppercase opacity-60">{new Date(booking.date).toLocaleDateString("en-US", { month: "short" })}</span>
                    <span className="text-2xl font-black italic">{new Date(booking.date).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-xl truncate group-hover:text-indigo-400 transition-colors italic tracking-tight">{booking.service?.title || "Service"}</h4>
                    <Badge className="bg-white/5 text-indigo-400 font-black uppercase tracking-widest text-[8px] mt-2">{booking.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-white/10">
                   <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      <MapPin className="size-4 text-indigo-500" /> {booking.service?.location || "Remote"}
                   </div>
                   {booking.pin && (
                     <span className="font-black text-indigo-500 tracking-tighter text-lg">#{booking.pin}</span>
                   )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
