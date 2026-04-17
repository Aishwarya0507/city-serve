import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent } from "../ui/dialog";
import {
  Plus, Trash2, Loader2, MapPin, RefreshCw, ShieldCheck, UploadCloud, Image as ImageIcon, X, Globe, Landmark, Building2, Home, Layers, Briefcase
} from "lucide-react";
import API from "../../lib/api";
import { toast } from "sonner";

export function ServiceManagement() {
  const [myServices, setMyServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);
  
  const [geoData, setGeoData] = useState({
     countries: [], states: [], districts: [], villages: []
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  
  const [formData, setFormData] = useState({
    title: "", category: "", subCategory: "", 
    country: "", state: "", district: "", village: "",
    price: "", description: "", experience: "5", image: "",
    duration: "60", bufferTime: "15"
  });

  const fetchServices = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await API.get("/services/provider");
      setMyServices(data);
    } catch (error) { console.error(error); } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories/all");
      setCategories(data);
    } catch (error) {}
  };

  const fetchGeoList = async (type: string, parentId: string | null = null) => {
    try {
      const url = parentId ? `/locations?parentId=${parentId}` : `/locations?type=${type}`;
      const { data } = await API.get(url);
      return data;
    } catch (error) { return []; }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const handleCountryChange = async (val: string) => {
    setFormData(prev => ({ ...prev, country: val, state: "", district: "", village: "" }));
    const c = geoData.countries.find((c: any) => c.name === val);
    if (c) {
       const states = await fetchGeoList("state", c._id);
       setGeoData(prev => ({ ...prev, states, districts: [], villages: [] }));
    }
  };

  const handleStateChange = async (val: string) => {
    setFormData(prev => ({ ...prev, state: val, district: "", village: "" }));
    const s = geoData.states.find((s: any) => s.name === val);
    if (s) {
       const districts = await fetchGeoList("district", s._id);
       setGeoData(prev => ({ ...prev, districts, villages: [] }));
    }
  };

  const handleDistrictChange = async (val: string) => {
    setFormData(prev => ({ ...prev, district: val, village: "" }));
    const d = geoData.districts.find((d: any) => d.name === val);
    if (d) {
       const villages = await fetchGeoList("village", d._id);
       setGeoData(prev => ({ ...prev, villages }));
    }
  };

  const handleCategoryChange = async (catName: string) => {
     setFormData(prev => ({ ...prev, category: catName, subCategory: "" }));
     const cat = categories.find(c => c.name === catName);
     if (cat) {
        try {
           const { data } = await API.get(`/subservices/category/${cat._id}`);
           setSubServices(data);
        } catch (error) {}
     }
  };

  const preloadData = async (service: any) => {
     const countries = await fetchGeoList("country");
     let states = [], districts = [], villages = [];

     if (service.country) {
        const c = countries.find((c: any) => c.name === service.country);
        if (c) {
           states = await fetchGeoList("state", c._id);
           if (service.state) {
              const s = states.find((s: any) => s.name === service.state);
              if (s) {
                 districts = await fetchGeoList("district", s._id);
                 if (service.district) {
                    const d = districts.find((d: any) => d.name === service.district);
                    if (d) {
                       villages = await fetchGeoList("village", d._id);
                    }
                 }
              }
           }
        }
     }
     setGeoData({ countries, states, districts, villages });
  };

  const handleAddService = async () => {
    setEditingService(null);
    const { data: profile } = await API.get("/auth/profile");
    await preloadData(profile);
    setFormData({
      title: "", category: "", subCategory: "",
      country: profile.country || "", state: profile.state || "",
      district: profile.district || "", village: profile.village || "",
      price: "", description: "", experience: "5", image: "",
      duration: "60", bufferTime: "15"
    });
    setSubServices([]);
    setIsDialogOpen(true);
  };

  const handleEditService = async (service: any) => {
    setEditingService(service);
    await preloadData(service);
    
    const cat = categories.find(c => c.name === service.category);
    if (cat) {
       try {
          const { data } = await API.get(`/subservices/category/${cat._id}`);
          setSubServices(data);
       } catch (error) {}
    }

    setFormData({
      title: service.title,
      category: service.category,
      subCategory: service.subCategory || "",
      country: service.country || "",
      state: service.state || "",
      district: service.district || "",
      village: service.village || "",
      price: service.price.toString(),
      description: service.description,
      experience: service.experience?.toString() || "5",
      image: service.image || "",
      duration: service.duration?.toString() || "60",
      bufferTime: service.bufferTime?.toString() || "15"
    });
    setIsDialogOpen(true);
  };

  const handleUpload = async (e: any) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const uploadData = new FormData();
     uploadData.append("image", file);
     setUploading(true);
     try {
       const { data } = await API.post("/upload", uploadData, {
         headers: { "Content-Type": "multipart/form-data" }
       });
       setFormData(prev => ({ ...prev, image: data.image }));
       toast.success("Artifact Captured");
     } catch (error) { toast.error("Transmission failed"); } finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.price) {
      toast.error("Seal all mandatory professional fields (Title, Category, Rate)");
      return;
    }
    try {
      const payload = { 
        ...formData, 
        price: parseFloat(formData.price), 
        experience: parseFloat(formData.experience),
        duration: parseInt(formData.duration),
        bufferTime: parseInt(formData.bufferTime)
      };
      if (editingService) {
        const { data } = await API.put(`/services/${editingService._id}`, payload);
        setMyServices(prev => prev.map(s => s._id === editingService._id ? data : s));
        toast.success("Listing Modified");
      } else {
        const { data } = await API.post("/services", payload);
        setMyServices(prev => [data, ...prev]);
        toast.success("Listing Registry Synchronized");
      }
      setIsDialogOpen(false);
    } catch (error) { toast.error("Sync Failure"); }
  };

  const displayedServices = activeTab === "all" ? myServices : myServices.filter(s => (s.status || "pending") === activeTab);

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto pb-40 font-sans text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-white">Service Hub</h1>
          <p className="text-slate-500 font-bold text-[10px] tracking-[0.3em] mt-3 uppercase opacity-60">Professional Resource Taxonomy</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="h-16 px-8 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all" onClick={() => fetchServices(true)} disabled={refreshing}>
             <RefreshCw className={`size-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 transition-all duration-700" onClick={handleAddService}>
            <Plus className="size-4 mr-2" /> New Registry
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl w-fit border border-white/5">
        {["all", "pending", "approved", "rejected"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab ? "bg-white/10 text-white shadow-xl" : "text-gray-500 hover:text-white"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? <div className="col-span-full py-40 text-center text-slate-500">Synchronizing...</div> : 
         displayedServices.length === 0 ? <div className="col-span-full py-40 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No registries detected</div> :
         displayedServices.map((s) => (
          <Card key={s._id} className="bg-[#0d0e1b] border-white/5 rounded-[3.5rem] overflow-hidden border-2 group hover:scale-[1.02] transition-all duration-700">
             <div className="aspect-video relative overflow-hidden">
                <img src={`http://localhost:5000${s.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1b] to-transparent opacity-80" />
                <Badge className="absolute top-6 left-6 bg-white/10 border-white/10 backdrop-blur-2xl text-[9px] font-black uppercase tracking-widest px-4 py-2">Verified Expert</Badge>
                <div className="absolute bottom-6 left-8">
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{s.category}</p>
                   <h3 className="text-xl font-black italic text-white">{s.title}</h3>
                </div>
             </div>
             <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center text-sm">
                   <div className="flex items-center gap-2 text-slate-300 font-bold"><MapPin className="size-4 text-indigo-500" /> {s.village || s.district || s.state}</div>
                   <div className="text-xl font-black italic text-white">₹{s.price}</div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/5">
                   <Button className="flex-1 h-14 rounded-2xl bg-white/5 hover:bg-white hover:text-black font-black uppercase tracking-widest text-[9px]" onClick={() => handleEditService(s)}>Modify</Button>
                   <Button variant="ghost" className="size-14 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white" onClick={async () => { if(confirm("Vanish?")) { await API.delete(`/services/${s._id}`); fetchServices(true); }}}><Trash2 className="size-4" /></Button>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[700px] bg-[#020617]/95 backdrop-blur-3xl border-white/10 border shadow-2xl rounded-[3rem] p-0 overflow-hidden outline-none [&>button]:hidden">
          <div className="p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsDialogOpen(false)} className="absolute top-8 right-8 size-10 rounded-full bg-white/5 text-slate-500 hover:text-white flex items-center justify-center border border-white/10 hover:bg-red-500/20 transition-all z-50">
               <X className="size-4" />
            </button>

            <div className="space-y-10">
               {/* Identity Header */}
               <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                  <div className="size-20 rounded-3xl bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center text-indigo-500">
                     <Plus className="size-8" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tighter italic text-white leading-none">{editingService ? "Modify Registry" : "New Professional Launch"}</h2>
                     <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[9px] mt-2">Service Integration Engine</p>
                  </div>
               </div>

               {/* Discovery Hub (Geographic + Taxonomy) */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 italic"><Layers className="size-3" /> Taxonomy Pillar</p>
                     <div className="space-y-4">
                        <Select value={formData.category} onValueChange={handleCategoryChange}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold italic px-5"><SelectValue placeholder="Pillar" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {categories.map(c => <SelectItem key={c._id} value={c.name} className="py-2.5 text-xs font-bold text-white">{c.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <Select value={formData.subCategory} onValueChange={(v) => setFormData({...formData, subCategory: v})}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold italic px-5"><SelectValue placeholder="Specialty" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {subServices.map(s => <SelectItem key={s._id} value={s.name} className="py-2.5 text-xs font-bold text-white">{s.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 italic"><MapPin className="size-3" /> Geo-Discovery</p>
                     <div className="grid grid-cols-2 gap-3">
                        <Select value={formData.country} onValueChange={handleCountryChange}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold text-xs px-4"><SelectValue placeholder="Country" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {geoData.countries.map((c: any) => <SelectItem key={c._id} value={c.name} className="text-xs font-bold">{c.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <Select value={formData.state} onValueChange={handleStateChange} disabled={!formData.country}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold text-xs px-4"><SelectValue placeholder="State" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {geoData.states.map((s: any) => <SelectItem key={s._id} value={s.name} className="text-xs font-bold">{s.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.state}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold text-xs px-4"><SelectValue placeholder="District" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {geoData.districts.map((d: any) => <SelectItem key={d._id} value={d.name} className="text-xs font-bold">{d.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <Select value={formData.village} onValueChange={(v) => setFormData({...formData, village: v})} disabled={!formData.district}>
                           <SelectTrigger className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold text-xs px-4"><SelectValue placeholder="Village" /></SelectTrigger>
                           <SelectContent className="bg-[#020617] border-white/10">
                              {geoData.villages.map((v: any) => <SelectItem key={v._id} value={v.name} className="text-xs font-bold">{v.name}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
               </div>

               {/* Visual Artifact */}
               <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Registry Media</Label>
                  <label className="w-full h-48 rounded-[2rem] bg-white/5 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600/50 transition-all group relative overflow-hidden">
                     <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                     {uploading ? <Loader2 className="animate-spin text-indigo-500" /> : 
                      formData.image ? <img src={`http://localhost:5000${formData.image}`} className="w-full h-full object-cover" /> :
                      <div className="text-center group-hover:scale-110 transition-transform duration-700">
                         <UploadCloud className="size-8 text-white/10 group-hover:text-indigo-500 mb-2 mx-auto" />
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Seal visual Artifact</span>
                      </div>
                     }
                  </label>
               </div>

               {/* Meta Data */}
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Public Title</Label>
                     <Input placeholder="Master Registry Name" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-bold italic px-6 focus:border-indigo-600/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Rate (₹)</Label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="h-14 rounded-xl bg-indigo-600 border-none text-white font-black text-xl italic text-center" />
                     </div>
                     <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Exp (Yrs)</Label>
                        <Input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-black text-xl italic text-center" />
                     </div>
                  </div>
               </div>

                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Duration (Min)</Label>
                      <Input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-black text-xl italic text-center" />
                   </div>
                   <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Buffer (Min)</Label>
                      <Input type="number" value={formData.bufferTime} onChange={(e) => setFormData({...formData, bufferTime: e.target.value})} className="h-14 rounded-xl bg-white/5 border-white/5 text-white font-black text-xl italic text-center" />
                   </div>
                </div>

                <div className="space-y-4">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Expert Summary</Label>
                   <Textarea placeholder="Professional scope details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="rounded-2xl bg-white/5 border-white/5 text-white p-6 min-h-[100px] text-sm" />
                </div>

               <Button className="w-full h-20 rounded-[1.5rem] bg-white text-black hover:bg-indigo-600 hover:text-white font-black uppercase tracking-widest transition-all duration-700 shadow-xl" onClick={handleSubmit}>
                  Synchronize Universal Listing
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
