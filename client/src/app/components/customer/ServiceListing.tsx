import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Star, MapPin, Clock, ShieldCheck, 
  ArrowRight, Search, Loader2, Sparkles, ChevronLeft, LayoutGrid, Layers, ChevronRight
} from "lucide-react";
import API from "../../lib/api";

export function ServiceListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  const [view, setView] = useState<"categories" | "subservices" | "listings">("categories");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubService, setSelectedSubService] = useState<any>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/categories/all");
      setCategories(data);
    } catch (error) {
      console.error("Fetch categories failed", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubServices = async (categoryId: string) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/subservices/category/${categoryId}`);
      setSubServices(data);
    } catch (error) {
      console.error("Fetch subservices failed", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async (categoryName: string, subServiceName: string) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/services?category=${encodeURIComponent(categoryName)}&subCategory=${encodeURIComponent(subServiceName)}`);
      setServices(data);
    } catch (error) {
      console.error("Fetch listings failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const jumpTo = searchParams.get("jumpTo");
    const categoryId = searchParams.get("categoryId");
    const categoryName = searchParams.get("categoryName");

    if (jumpTo === "subservices" && categoryId && categoryName) {
      setSelectedCategory({ _id: categoryId, name: categoryName });
      fetchSubServices(categoryId);
      setView("subservices");
    } else {
      fetchCategories();
      setView("categories");
    }
  }, [searchParams]);

  const handleCategorySelect = (category: any) => {
     setSelectedCategory(category);
     fetchSubServices(category._id);
     setView("subservices");
  };

  const handleSubServiceSelect = (sub: any) => {
     setSelectedSubService(sub);
     fetchListings(selectedCategory.name, sub.name);
     setView("listings");
  };

  const goBack = () => {
     if (view === "listings") {
        setView("subservices");
        setSelectedSubService(null);
     } else if (view === "subservices") {
        setView("categories");
        setSelectedCategory(null);
        if (categories.length === 0) fetchCategories();
     }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-40 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="space-y-3">
              <div className="flex items-center gap-4">
                 {view !== "categories" && (
                   <Button variant="ghost" size="icon" onClick={goBack} className="rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
                      <ChevronLeft className="size-5" />
                   </Button>
                 )}
                 <h1 className="text-5xl font-black italic tracking-tighter">
                   {view === "categories" ? "Professional Hub" : 
                    view === "subservices" ? selectedCategory.name :
                    selectedSubService.name}
                 </h1>
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                {view === "categories" ? "Drill down into our elite service taxonomy" : 
                 view === "subservices" ? `Select a specific ${selectedCategory.name.toLowerCase()} specialty` :
                 `Verified ${selectedSubService.name.toLowerCase()} experts ready for action`}
              </p>
           </div>
           
           <div className="relative group max-w-md w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search taxonomy..." 
                className="w-full h-16 bg-[#0d0e1b] border-2 border-white/5 rounded-2xl pl-16 pr-8 font-bold text-white placeholder:text-slate-700 focus:border-indigo-600/50 transition-all outline-none"
              />
           </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
             <Loader2 className="size-16 animate-spin text-indigo-600" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
             {view === "categories" && (
                <motion.div key="categories" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                   {categories.map((cat) => (
                      <Card key={cat._id} className="group bg-[#0d0e1b] border-white/5 hover:border-indigo-600/30 rounded-[3rem] overflow-hidden cursor-pointer transition-all duration-700 shadow-2xl border-2" onClick={() => handleCategorySelect(cat)}>
                         <CardContent className="p-12 text-center aspect-square flex flex-col items-center justify-center relative">
                            <div className="absolute inset-x-0 -top-10 h-32 bg-indigo-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="mb-8 size-24 rounded-[2rem] bg-indigo-600/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-1000 overflow-hidden">
                               {cat.image ? <img src={`http://localhost:5000${cat.image}`} className="w-full h-full object-cover" /> : <LayoutGrid className="size-10 text-indigo-500" />}
                            </div>
                            <h3 className="font-black text-xs uppercase tracking-[0.2em] group-hover:text-white transition-colors">{cat.name}</h3>
                            <ChevronRight className="size-5 text-white/10 group-hover:text-white group-hover:translate-x-2 transition-all mt-6" />
                         </CardContent>
                      </Card>
                   ))}
                </motion.div>
             )}

             {view === "subservices" && (
                <motion.div key="subservices" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {subServices.length === 0 ? (
                      <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                         <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No specialized services discovered under this pillar</p>
                      </div>
                   ) : (
                      subServices.map((sub) => (
                         <Card key={sub._id} className="group bg-[#0d0e1b] border-white/5 hover:bg-indigo-600/5 border-2 hover:border-indigo-600/30 rounded-[2.5rem] p-10 cursor-pointer transition-all duration-500 relative overflow-hidden" onClick={() => handleSubServiceSelect(sub)}>
                            <div className="flex items-center justify-between mb-6">
                               <div className="size-14 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  <Layers className="size-6" />
                               </div>
                               <ArrowRight className="size-5 text-white/10 group-hover:text-white group-hover:translate-x-2 transition-all" />
                            </div>
                            <h4 className="text-xl font-black text-white italic tracking-tighter mb-4">{sub.name}</h4>
                            <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">"{sub.description || `Verified professional ${sub.name.toLowerCase()} assistance for your requirements.`}"</p>
                         </Card>
                      ))
                   )}
                </motion.div>
             )}

             {view === "listings" && (
                <motion.div key="listings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                   {services.length === 0 ? (
                      <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                         <Sparkles className="size-16 mx-auto mb-6 text-slate-800" />
                         <p className="text-slate-500 font-black uppercase tracking-widest text-xs tracking-[0.2em]">No provider registries found for this specialty yet</p>
                      </div>
                   ) : (
                      services.map((service) => (
                        <motion.div layout key={service._id} className="group cursor-pointer" onClick={() => navigate(`/customer/book/${service._id}`)}>
                           <Card className="bg-[#0d0e1b] border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-1000 hover:scale-[1.02] border-0 ring-2 ring-white/5 hover:ring-indigo-600/30">
                              <div className="relative aspect-[16/10] overflow-hidden">
                                 <img src={service.image ? `http://localhost:5000${service.image}` : "https://via.placeholder.com/800x500"} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-[2000ms] grayscale-[0.2] group-hover:grayscale-0" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1b] via-transparent to-transparent" />
                                 <div className="absolute top-8 left-8">
                                    <Badge className="bg-white/10 backdrop-blur-3xl text-white font-black px-5 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest border-white/10">
                                       <ShieldCheck className="size-3.5 mr-2 text-indigo-400" /> Verified 
                                    </Badge>
                                 </div>
                                 <div className="absolute bottom-8 left-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">{service.provider?.name}</p>
                                    <h3 className="text-2xl font-black italic tracking-tighter text-white leading-tight">{service.title}</h3>
                                 </div>
                              </div>
                              <CardContent className="p-10 space-y-10">
                                 <div className="grid grid-cols-2 gap-8 font-bold text-sm">
                                    <div className="space-y-1">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vicinity</p>
                                       <div className="flex items-center gap-2"><MapPin className="size-4 text-indigo-500" />{service.location}</div>
                                    </div>
                                    <div className="space-y-1">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expertise</p>
                                       <div className="flex items-center gap-2 text-indigo-400 uppercase text-[11px]">{service.experience || 5} yrs exp</div>
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                    <div className="flex flex-col gap-1">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Premium Rate</p>
                                       <span className="text-4xl font-black text-white italic tracking-tighter">₹{service.price}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                       <div className="flex items-center gap-1.5 bg-indigo-600 shadow-glow px-3 py-1.5 rounded-xl">
                                          <Star className="size-3.5 fill-white text-white" />
                                          <span className="text-[11px] font-black text-white">{service.averageRating || 4.8}</span>
                                       </div>
                                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{service.numReviews || 120} reviews</span>
                                    </div>
                                 </div>
                                 <Button className="w-full h-20 rounded-[1.5rem] bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-600/20 transition-all duration-700">
                                    Secure Session <ArrowRight className="size-4 ml-2" />
                                 </Button>
                              </CardContent>
                           </Card>
                        </motion.div>
                      ))
                   )}
                </motion.div>
             )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
