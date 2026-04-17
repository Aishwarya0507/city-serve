import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge";
import { 
  CalendarDays, Clock, Save, Plus, Trash2, 
  Settings2, Calendar as CalendarIcon, Zap, X, Layers, ChevronRight, ArrowLeft
} from "lucide-react";
import API from "../../lib/api";
import { toast } from "sonner";
import { format, isSameDay, startOfDay } from "date-fns";

export function AvailabilitySetup() {
  const [view, setView] = useState<"selection" | "setup">("selection");
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [masterSchedule, setMasterSchedule] = useState<any>({
    workingDays: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 18
  });
  const [overrides, setOverrides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [overrideForm, setOverrideForm] = useState({
    isAvailable: false,
    startHour: 9,
    endHour: 18
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/services/provider");
      setServices(data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceData = async (serviceId: string) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/availability/schedule/me?serviceId=${serviceId}`);
      setMasterSchedule(data.masterSchedule);
      setOverrides(data.overrides || []);
    } catch (error: any) {
       setMasterSchedule({ workingDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 18 });
       setOverrides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    fetchServiceData(service._id);
    setView("setup");
  };

  const handleSaveMaster = async () => {
    setSaving(true);
    try {
      await API.put("/availability/schedule/me", {
        serviceId: selectedService._id,
        ...masterSchedule
      });
      toast.success(`${selectedService.name || selectedService.title || 'Service'} Synchronized`);
      fetchServiceData(selectedService._id);
    } catch (error: any) {
      toast.error(`Save Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddOverrides = async () => {
    if (selectedDates.length === 0) return toast.error("Selection Required");
    setSaving(true);
    try {
      for (const date of selectedDates) {
        await API.post("/availability/block", {
          serviceId: selectedService._id,
          specificDate: date,
          ...overrideForm
        });
      }
      fetchServiceData(selectedService._id);
      setSelectedDates([]);
      toast.success(`Synchronized`);
    } catch (error: any) {
       toast.error(`Override Failed: ${error.response?.data?.message || error.message}`);
    } finally {
       setSaving(false);
    }
  };

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading && view === 'selection') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
       <div className="size-16 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center animate-pulse border border-indigo-600/20">
          <Settings2 className="size-8 text-indigo-500 animate-spin" />
       </div>
       <p className="font-heading font-black text-xl italic tracking-tighter animate-pulse text-white uppercase opacity-40">Connecting Services...</p>
    </div>
  );

  if (view === "selection") return (
    <div className="p-4 sm:p-12 space-y-12 max-w-5xl mx-auto font-sans text-white">
      <div className="space-y-4 text-center">
         <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-white uppercase">Availability Hub</h1>
         <p className="text-slate-500 font-bold text-xs tracking-[0.4em] uppercase opacity-70">Manage Per-Service Grid</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
         {services.map((s) => (
           <motion.div key={s._id} whileHover={{ y: -10 }} onClick={() => handleSelectService(s)} className="group cursor-pointer">
              <Card className="bg-[#0b0c15] border-2 border-white/5 group-hover:border-emerald-500 transition-all rounded-[3.5rem] p-10 h-[380px] flex flex-col justify-between shadow-3xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Layers className="size-48" />
                 </div>
                 <div className="space-y-6 relative z-10">
                    <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                       <Layers className="size-8 text-emerald-500" />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black italic mb-2 tracking-tighter uppercase leading-[0.9]">{s.name || s.title || 'Service'}</h3>
                       <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1">
                          {s.category?.name || 'Isolated'}
                       </Badge>
                    </div>
                 </div>
                 <div className="mt-12 flex items-center justify-between relative z-10">
                    <span className="text-emerald-500 font-black italic uppercase text-xs tracking-widest leading-none">Calibrate Schedule</span>
                    <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all">
                       <ChevronRight className="size-5" />
                    </div>
                 </div>
              </Card>
           </motion.div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-10 max-w-7xl mx-auto pb-40 font-sans text-white">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div className="space-y-4">
           <Button variant="ghost" onClick={() => setView("selection")} className="bg-white/5 text-slate-400 font-black uppercase text-[10px] rounded-full px-4 hover:bg-white/10 hover:text-white transition-all">
              <ArrowLeft className="size-4 mr-2" /> Back
           </Button>
           <div className="flex items-center gap-6">
              <div className="size-16 rounded-[2.2rem] bg-emerald-500 flex items-center justify-center shadow-2xl">
                 <Layers className="size-8 text-white" />
              </div>
              <div>
                 <h1 className="text-4xl sm:text-6xl font-black italic tracking-tighter uppercase leading-[0.9]">{selectedService.name || selectedService.title}</h1>
                 <p className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mt-1 opacity-70">Strict Per-Service Availability</p>
              </div>
           </div>
        </div>
        <Button disabled={saving} onClick={handleSaveMaster} className="h-16 px-10 rounded-[2rem] bg-emerald-500 hover:bg-white hover:text-black text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl transition-all duration-700">
           {saving ? <Plus className="animate-spin" /> : <Save className="size-4 mr-3" />}
           Save Settings
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <Card className="bg-[#0b0c15] border-white/5 rounded-[3rem] p-10 space-y-8 border-2 shadow-inner">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CalendarDays className="size-6" />
               </div>
               <h3 className="text-xl font-black italic uppercase">Operating Week</h3>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
               {dayNames.map((day, idx) => {
                  const isActive = (masterSchedule.workingDays || []).includes(idx);
                  return (
                     <button key={day} onClick={() => {
                        const current = masterSchedule.workingDays || [];
                        const next = isActive ? current.filter((d: number) => d !== idx) : [...current, idx];
                        setMasterSchedule({...masterSchedule, workingDays: next});
                     }} className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${isActive ? "bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "bg-white/5 border-white/5 text-slate-600"}`}>
                        {day.slice(0, 3)}
                     </button>
                  );
               })}
            </div>
         </Card>

         <Card className="bg-[#0b0c15] border-white/5 rounded-[3rem] p-10 space-y-8 border-2 shadow-inner">
            <div className="flex items-center gap-4">
               <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Clock className="size-6" />
               </div>
               <h3 className="text-xl font-black italic uppercase">Daily Window</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Launch</Label>
                  <Select value={masterSchedule.startHour.toString()} onValueChange={(v) => setMasterSchedule({...masterSchedule, startHour: parseInt(v)})}>
                     <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-black text-lg"><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-[#0b0c15] border-white/10">
                        {Array.from({length: 24}).map((_, i) => <SelectItem key={i} value={i.toString()} className="text-white font-black">{i}:00</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Cutoff</Label>
                  <Select value={masterSchedule.endHour.toString()} onValueChange={(v) => setMasterSchedule({...masterSchedule, endHour: parseInt(v)})}>
                     <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-black text-lg"><SelectValue /></SelectTrigger>
                     <SelectContent className="bg-[#0b0c15] border-white/10">
                        {Array.from({length: 24}).map((_, i) => <SelectItem key={i} value={i.toString()} className="text-white font-black">{i}:00</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
            </div>
         </Card>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
         <Card className="lg:col-span-12 xl:col-span-7 bg-[#0b0c15] border-white/5 rounded-[3.5rem] border-2 overflow-hidden flex flex-col md:flex-row shadow-3xl ring-1 ring-white/5">
            <div className="p-8 bg-white/2 md:border-r border-white/5 flex items-center justify-center">
               <Calendar 
                  mode="multiple" 
                  selected={selectedDates} 
                  onSelect={(dates) => setSelectedDates(dates || [])} 
                  className="rounded-3xl scale-110"
                  modifiers={{
                    blocked: (date) => overrides.some(o => !o.isAvailable && isSameDay(new Date(o.specificDate), date)),
                    custom: (date) => overrides.some(o => o.isAvailable && isSameDay(new Date(o.specificDate), date))
                  }}
                  modifiersStyles={{
                    blocked: { backgroundColor: '#ef4444', color: 'white', fontWeight: '900', borderRadius: '12px' },
                    custom: { backgroundColor: '#10b981', color: 'white', fontWeight: '900', borderRadius: '12px' }
                  }}
               />
            </div>
            <div className="p-10 flex-1 flex flex-col justify-between space-y-10 bg-gradient-to-br from-indigo-500/5 to-transparent">
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <span className={`text-xl font-black italic ${overrideForm.isAvailable ? "text-emerald-500" : "text-rose-500"}`}>
                        {overrideForm.isAvailable ? "ALLOW SHIFT" : "BLOCK DAY"}
                     </span>
                     <Switch checked={overrideForm.isAvailable} onCheckedChange={(v) => setOverrideForm({...overrideForm, isAvailable: v})} className="scale-125" />
                  </div>
                  
                  <AnimatePresence>
                     {overrideForm.isAvailable && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-500">Launch</Label>
                              <Input type="number" value={overrideForm.startHour} onChange={(e) => setOverrideForm({...overrideForm, startHour: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-white/5 border-white/10 text-center font-black" />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-500">Cutoff</Label>
                              <Input type="number" value={overrideForm.endHour} onChange={(e) => setOverrideForm({...overrideForm, endHour: parseInt(e.target.value)})} className="h-14 rounded-2xl bg-white/5 border-white/10 text-center font-black" />
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
               <Button disabled={selectedDates.length === 0 || saving} onClick={handleAddOverrides} className="h-20 rounded-[2.5rem] bg-indigo-600 text-white font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700 shadow-2xl flex items-center justify-center gap-4">
                  Synchronize
               </Button>
            </div>
         </Card>

         <div className="lg:col-span-12 xl:col-span-5 flex flex-col space-y-6">
            <div className="flex items-center justify-between px-3">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-white/40">Exceptions Registry</span>
               <Badge className="bg-white/5 text-slate-400 border-none uppercase text-[9px] font-black px-4">{selectedService.name || selectedService.title}</Badge>
            </div>
            <div className="h-[480px] overflow-y-auto custom-scrollbar space-y-4 pr-3">
               {overrides.length === 0 ? (
                  <div className="h-full border-2 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center opacity-10">
                     <CalendarIcon className="size-12 mb-4" />
                     <p className="font-black italic uppercase tracking-widest leading-none">Operating Clear</p>
                  </div>
               ) : (
                  overrides.sort((a,b) => new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime()).map((o) => (
                     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={o._id} className="bg-[#121320] border-2 border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-xl">
                        <div className="flex items-center gap-5">
                           <div className={`size-12 rounded-2xl flex items-center justify-center ${o.isAvailable ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                              <Zap className="size-5" />
                           </div>
                           <div>
                              <h4 className="font-black italic text-lg">{format(new Date(o.specificDate), 'MMMM d, yyyy')}</h4>
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                                 {o.isAvailable ? `WINDOW: ${o.startHour}:00 - ${o.endHour}:00` : "FULL BLOCK"}
                              </p>
                           </div>
                        </div>
                        <Button variant="ghost" className="size-12 rounded-2xl hover:bg-rose-500 hover:text-white text-rose-500/40 transition-all" onClick={async () => {
                           try {
                             await API.delete("/availability/block", { data: { specificDate: o.specificDate, serviceId: selectedService._id } });
                             fetchServiceData(selectedService._id);
                             toast.success("Synchronized");
                           } catch(e: any) {
                             toast.error(`Delete Failed: ${e.response?.data?.message || e.message}`);
                           }
                        }}><Trash2 className="size-5" /></Button>
                     </motion.div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
