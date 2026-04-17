import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import {
  MapPin, Clock, Star, ChevronRight, Zap, Heart, ShieldCheck, Briefcase, GraduationCap, Stethoscope, Scale, Home, Download, CalendarCheck, UserCheck, CheckCircle2, Layout, MousePointer2, ArrowRight, ArrowLeft
} from "lucide-react";
import API from "../lib/api";
import { ThemeToggle } from "./ui/ThemeToggle";

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const CATEGORIES = [
  { 
    id: "healthcare", 
    name: "Healthcare Services", 
    tags: "Doctors • Specialists • Dentists • Mental Health",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "legal", 
    name: "Legal Services", 
    tags: "Family Law • Property • Criminal • Tax Lawyers",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "education", 
    name: "Education & Tutoring", 
    tags: "School Tutors • Skill Training • Coaching • Mentors",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "professional", 
    name: "Professional Services", 
    tags: "Accountants • Real Estate • Architects • Consultants",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
  },
  { 
    id: "local", 
    name: "Local & Home Services", 
    tags: "Electricians • Plumbers • Cleaning • Auto Repair",
    image: "/images/local-services-new.png"
  },
];

const STEPS = [
  { title: "Choose Service", desc: "Browse categories to find exactly what you need.", icon: <Layout className="size-6 text-indigo-400" /> },
  { title: "Select Professional", desc: "View detailed profiles and verified ratings.", icon: <UserCheck className="size-6 text-indigo-400" /> },
  { title: "Pick Date & Time", desc: "Choose a slot that fits your schedule perfectly.", icon: <CalendarCheck className="size-6 text-indigo-400" /> },
  { title: "Confirm Appointment", desc: "Instant confirmation and seamless coordination.", icon: <CheckCircle2 className="size-6 text-indigo-400" /> },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const stepsRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: stepsRef as any,
    offset: ["start center", "end center"]
  });
  
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const { scrollYProgress: globalScroll } = useScroll();
  const scaleX = useTransform(globalScroll, [0, 1], [0, 1]);

  // Scrollspy logic
  useEffect(() => {
    const sections = ["services", "professionals", "cta"];
    const sectionElements = sections.map(id => document.getElementById(id));
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const id = entry.target.id;
          if (id === "services") setActiveTab("Services");
          else if (id === "professionals") setActiveTab("Bookings");
          else if (id === "cta") setActiveTab("Support");
        }
      });
    }, { threshold: [0.3] });

    sectionElements.forEach(el => el && observer.observe(el));
    
    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveTab(null);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const locRes = await API.get("/locations");
        setLocations(locRes.data);
        if (locRes.data.length > 0) {
          setSelectedLocation(locRes.data[0].city_name);
        }
      } catch (error) {
        console.error("Error fetching landing data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Services") {
       document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "Bookings") {
       document.getElementById("professionals")?.scrollIntoView({ behavior: "smooth" });
    } else if (tab === "Support") {
       document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden font-sans">
      {/* Global Scroll Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-blue-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-28 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setActiveTab(null);
            }}>
              <div className="size-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="size-6 text-white fill-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter italic">CITY<span className="text-indigo-600">SERVE</span></span>
            </div>
            
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-inner">
              {["Services", "Bookings", "Support"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative ${
                    activeTab === tab 
                    ? "text-white" 
                    : "text-slate-500 dark:text-white/30 hover:text-indigo-600 dark:hover:text-white"
                  }`}
                >
                  <AnimatePresence>
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="nav-tab" 
                        className="absolute inset-0 bg-indigo-600 rounded-2xl z-0 shadow-lg shadow-indigo-600/30" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative z-10">{tab}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" className="font-black uppercase tracking-widest text-[10px] hidden sm:flex" onClick={() => navigate("/login")}>Login</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-[10px] px-8 py-6 rounded-2xl shadow-lg shadow-indigo-500/20" onClick={() => navigate("/signup")}>Join Now</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-64 pb-32 px-6">
        <div className="absolute top-0 right-0 -mr-40 -mt-20 size-[700px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <Badge variant="glass" className="mb-8 bg-indigo-600/10 text-indigo-600 border-indigo-600/20 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
              The Gold Standard of Expertise
            </Badge>
            <h1 className="text-6xl md:text-[5.5rem] font-black tracking-tighter leading-[0.85] mb-10">
              Book Appointments <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">with Trusted Pros.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-white/40 mb-14 font-bold leading-relaxed max-w-xl">
              Schedule appointments instantly with verified professionals across <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Healthcare</span>, <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">Legal</span>, and <span className="text-indigo-500 underline decoration-indigo-500/30 underline-offset-8">More</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch gap-4 p-3 bg-slate-100 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-3xl mb-16 max-w-xl">
              <div className="flex-1 flex items-center px-8 h-20 gap-4 border-r border-slate-200 dark:border-white/10">
                <MapPin className="size-6 text-indigo-600" />
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="border-none bg-transparent h-full text-slate-900 dark:text-white font-black text-lg p-0 focus:ring-0 shadow-none">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-black/90 backdrop-blur-2xl">
                    {locations.map(loc => <SelectItem key={loc._id} value={loc.city_name} className="rounded-xl mx-2 font-bold py-3">{loc.city_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="h-20 px-12 rounded-[1.8rem] bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95" onClick={() => navigate("/signup")}>
                Find Pros <ChevronRight className="size-5 ml-2" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-10">
               <div className="flex -space-x-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="size-14 rounded-full border-4 border-[#020617] bg-slate-800 overflow-hidden relative group/avatar shadow-2xl">
                      <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="avatar" className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                    </div>
                  ))}
               </div>
               <div>
                  <div className="flex items-center gap-1.5 text-yellow-500">
                    <Star className="size-5 fill-yellow-500" />
                    <Star className="size-5 fill-yellow-500" />
                    <Star className="size-5 fill-yellow-500" />
                    <Star className="size-5 fill-yellow-500" />
                    <Star className="size-5 fill-yellow-500" />
                  </div>
                  <p className="text-xs font-black text-slate-500 dark:text-white/30 uppercase tracking-[0.2em] mt-2">Elite Satisfaction Rate</p>
               </div>
            </div>
          </motion.div>

          {/* Hero Section Main Image Fix */}
          <motion.div initial={{ opacity: 0, scale: 0.9, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative hidden lg:block">
            <div className="absolute inset-0 bg-indigo-600/30 blur-[120px] rounded-full" />
            <div className="relative aspect-[3/4] rounded-[4rem] overflow-hidden border border-white/10 shadow-3xl group/hero">
               <img 
                 src="/images/hero-doctor-new.jpg" 
                 alt="Professional Consultation" 
                 className="w-full h-full object-cover grayscale-[0.3] group-hover/hero:grayscale-0 transition-all duration-1000 scale-100 group-hover/hero:scale-105" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
               <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-5 mb-6">
                     <div className="size-20 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-1 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden">
                        <img 
                          src="/images/hero-doctor-new.jpg" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                     <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/40">
                       Live Expert Advice
                     </Badge>
                  </div>
                  <h3 className="text-white font-black text-3xl tracking-tighter italic leading-tight">Trusted by 50,000+ <br /> Users Globally Professionals.</h3>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Explore Services Section */}
      <section id="services" className="py-40 bg-slate-50/50 dark:bg-white/[0.01] border-y border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-2">
            <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
               <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">Explore Services</h2>
               <p className="text-xl text-slate-500 dark:text-white/40 font-bold max-w-lg">Curated expertise across five specialized domains. Designed for modern living.</p>
            </motion.div>
            <div className="flex items-center gap-4">
               <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="size-14 rounded-2xl border-white/10 bg-white dark:bg-white/5 shadow-xl hover:bg-indigo-600 hover:text-white transition-all" onClick={() => scrollCategories('left')}>
                    <ArrowLeft className="size-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="size-14 rounded-2xl border-white/10 bg-white dark:bg-white/5 shadow-xl hover:bg-indigo-600 hover:text-white transition-all" onClick={() => scrollCategories('right')}>
                    <ArrowRight className="size-5" />
                  </Button>
               </div>
            </div>
          </div>

          <motion.div 
            ref={scrollContainerRef}
            variants={containerVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            className="flex gap-10 overflow-x-auto pb-12 pt-4 px-2 cursor-grab active:cursor-grabbing scrollbar-hide no-scrollbar"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat) => (
              <motion.div key={cat.id} variants={itemVariants} className="min-w-[340px] md:min-w-[450px] scroll-snap-align-start">
                <Card 
                  className="group relative h-[600px] border-none shadow-premium dark:shadow-premium-dark rounded-[3.5rem] overflow-hidden cursor-pointer transition-all duration-1000" 
                  onClick={() => navigate("/login")}
                >
                  <div className="absolute inset-0">
                     <img 
                       src={cat.image} 
                       alt={cat.name} 
                       className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                  </div>
                  <CardContent className="h-full relative flex flex-col justify-end p-12">
                     <div className="absolute top-10 right-10 size-16 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                        <ArrowRight className="size-6 text-white" />
                     </div>
                     <h3 className="text-4xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors uppercase tracking-widest italic">{cat.name}</h3>
                     <p className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-6 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{cat.tags}</p>
                     
                     <div className="flex items-center gap-3 text-white/40 text-[10px] font-black uppercase tracking-[0.4em] transform transition-all duration-700 group-hover:translate-x-4">
                        Instant Booking <div className="h-px w-12 bg-indigo-600" />
                     </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works with Curved Line */}
      <section id="professionals" className="py-48 px-6 overflow-hidden bg-white dark:bg-[#020617]" ref={stepsRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-40 max-w-2xl mx-auto">
             <div className="flex justify-center mb-6">
                <Badge variant="outline" className="text-indigo-600 border-indigo-600/20 px-6 py-2 rounded-full uppercase tracking-widest text-[9px] font-black italic shadow-glow">Process Intelligence</Badge>
             </div>
             <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-700 to-slate-400 dark:from-white dark:via-white dark:to-white/40">Elegance in Appointment Flow.</h2>
             <p className="text-xl text-slate-500 dark:text-white/40 font-bold leading-relaxed italic">Experience the most streamlined and intuitive professional booking journey ever designed.</p>
          </div>

          <div className="relative">
            {/* Curved Travel Line SVG */}
            <div className="absolute top-0 left-0 w-full h-full hidden lg:block pointer-events-none z-0">
               <svg width="100%" height="200" viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform translate-y-8">
                  <path 
                    d="M100 100 C300 10, 500 190, 700 100 C900 10, 1100 100, 1100 100" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className="text-slate-100 dark:text-white/[0.03]" 
                  />
                  <motion.path 
                    d="M100 100 C300 10, 500 190, 700 100 C900 10, 1100 100, 1100 100" 
                    stroke="url(#gradient-flow)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    strokeDasharray="0 1"
                    style={{ pathLength }}
                    className="shadow-glow"
                  />
                  <defs>
                    <linearGradient id="gradient-flow" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4f46e5" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10 font-sans">
              {STEPS.map((step, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: idx * 0.15, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative group lg:px-6"
                >
                  <div className="absolute -top-16 -left-8 text-[10rem] font-black text-slate-100 dark:text-white/[0.02] select-none group-hover:text-indigo-500/5 transition-colors duration-1000 italic leading-none">
                    0{idx + 1}
                  </div>
                  <div className="relative pt-4">
                    <div className="size-20 rounded-[2rem] bg-indigo-600/5 dark:bg-white/[0.03] flex items-center justify-center mb-10 border border-white/10 group-hover:bg-indigo-600 group-hover:translate-y-[-10px] group-hover:rotate-[10deg] group-hover:shadow-glow transition-all duration-700 bg-white dark:bg-[#020617] backdrop-blur-xl">
                      <div className="group-hover:text-white group-hover:scale-110 transition-all duration-700">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-6 tracking-tight italic group-hover:text-indigo-600 transition-colors uppercase">{step.title}</h3>
                    <p className="text-slate-500 dark:text-white/40 font-bold text-base leading-relaxed group-hover:text-slate-900 dark:group-hover:text-white/60 transition-colors">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive CTA Section - Effective & Global */}
      <section id="cta" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="relative p-16 md:p-32 rounded-[6rem] bg-[#020617] border border-white/5 overflow-hidden text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] group/cta"
           >
              {/* Dynamic Gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-blue-900/30 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-1000" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] bg-indigo-600 rounded-full blur-[160px] pointer-events-none" 
              />
              
              <div className="relative z-10">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 }}
                 >
                    <Badge className="bg-white/5 text-indigo-400 border-white/10 mb-12 px-8 py-3 rounded-full uppercase tracking-[0.5em] text-[10px] font-black italic shadow-2xl">
                       Join the global network
                    </Badge>
                    <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter text-white mb-12 leading-[0.8] italic">
                       Appointments <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-blue-400">Made Simple.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-white/30 font-bold mb-20 max-w-3xl mx-auto leading-relaxed italic">
                       Book trusted professionals anytime, anywhere. Experience the premium standard of expertise redefine your every day.
                    </p>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                       <Button 
                         className="h-24 px-16 rounded-[2rem] bg-indigo-600 hover:bg-white text-white hover:text-[#020617] font-black uppercase tracking-[0.2em] text-[11px] shadow-glow hover:shadow-2xl group/btn transition-all duration-700" 
                         onClick={() => navigate("/signup")}
                       >
                          Start Booking Now
                          <ArrowRight className="size-6 ml-6 group-hover/btn:rotate-[-45deg] group-hover/btn:scale-125 transition-all duration-700" />
                       </Button>
                       <Button 
                         variant="outline" 
                         className="h-24 px-16 rounded-[2rem] border-white/10 hover:border-white/20 hover:bg-white/5 text-white font-black uppercase tracking-[0.2em] text-[11px] bg-white/[0.02] backdrop-blur-3xl shadow-2xl transition-all duration-700"
                         onClick={() => window.open("#", "_blank")}
                       >
                          <Download className="size-5 mr-4" /> Download App
                       </Button>
                    </div>

                    {/* Stats Counter Feel */}
                    <div className="mt-32 grid grid-cols-2 md:grid-cols-3 gap-12 max-w-4xl mx-auto opacity-40 group-hover/cta:opacity-100 transition-opacity duration-1000">
                       <div>
                          <p className="text-4xl font-black text-white italic">50K+</p>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">Verified Users</p>
                       </div>
                       <div>
                          <p className="text-4xl font-black text-white italic">2.5K+</p>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">Active Pros</p>
                       </div>
                       <div className="hidden md:block">
                          <p className="text-4xl font-black text-white italic">120+</p>
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">Core Sectors</p>
                       </div>
                    </div>
                 </motion.div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-32 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/10 dark:bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16 text-center md:text-left">
           <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="size-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                  <Zap className="size-8 text-white fill-white" />
                </div>
                <span className="text-4xl font-black tracking-tighter italic">CITY<span className="text-indigo-600">SERVE</span></span>
              </div>
              <p className="text-xs font-black text-slate-500 dark:text-white/20 uppercase tracking-[0.8em]">Defining The Elite Standard</p>
           </div>
           
           <div className="flex gap-20">
              <div>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/50 mb-10 italic">Universe</p>
                 <ul className="space-y-5 text-xs font-black text-slate-600 dark:text-white/40 uppercase tracking-widest font-sans">
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Platform</li>
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Network</li>
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Ecosystem</li>
                 </ul>
              </div>
              <div>
                 <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/50 mb-10 italic">Protocol</p>
                 <ul className="space-y-5 text-xs font-black text-slate-600 dark:text-white/40 uppercase tracking-widest font-sans">
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</li>
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Terms</li>
                    <li className="hover:text-indigo-600 cursor-pointer transition-colors">Compliance</li>
                 </ul>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">
           <p>&copy; 2026 CityServe Global Hub. All rights reserved.</p>
           <div className="flex items-center gap-12">
              <span className="hover:text-white cursor-pointer transition-colors">Global Presence</span>
              <div className="size-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="hover:text-white cursor-pointer transition-colors">System Status: Active</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
