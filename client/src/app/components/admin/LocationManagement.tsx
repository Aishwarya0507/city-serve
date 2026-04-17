import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { 
  MapPin, Plus, Pencil, Trash2, Loader2, Globe, Landmark, Building2, Home, ChevronRight, ArrowLeft 
} from "lucide-react";
import API from "../../lib/api";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, any> = {
  country: <Globe className="size-5" />,
  state: <Landmark className="size-5" />,
  district: <Building2 className="size-5" />,
  village: <Home className="size-5" />,
};

const TYPE_ORDER = ["country", "state", "district", "village"];

export function LocationManagement() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStack, setViewStack] = useState<any[]>([]); // To track breadcrumbs/navigation
  const [currentLevel, setCurrentLevel] = useState<string>("country");
  const [parentId, setParentId] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: "", type: "country", parentId: "" });

  const fetchLocations = async (pid: string | null, type: string) => {
    setLoading(true);
    try {
      const url = pid ? `/locations?parentId=${pid}` : `/locations?type=${type}`;
      const { data } = await API.get(url);
      setLocations(data);
    } catch (error) {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(parentId, currentLevel);
  }, [parentId, currentLevel]);

  const handleNavigateDown = (loc: any) => {
    const nextTypeIdx = TYPE_ORDER.indexOf(loc.type) + 1;
    if (nextTypeIdx < TYPE_ORDER.length) {
      setViewStack([...viewStack, loc]);
      setParentId(loc._id);
      setCurrentLevel(TYPE_ORDER[nextTypeIdx]);
    } else {
      toast.info("Reached maximum granularity (Village level)");
    }
  };

  const handleNavigateUp = () => {
    const newStack = [...viewStack];
    newStack.pop();
    setViewStack(newStack);
    
    if (newStack.length === 0) {
      setParentId(null);
      setCurrentLevel("country");
    } else {
      const parent = newStack[newStack.length - 1];
      setParentId(parent._id);
      setCurrentLevel(TYPE_ORDER[TYPE_ORDER.indexOf(parent.type) + 1]);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name) return toast.error("Name is required");
    try {
      await API.post("/locations", {
        ...newLocation,
        parentId: parentId || null,
        type: currentLevel
      });
      toast.success(`${currentLevel} added successfully`);
      setIsAddDialogOpen(false);
      setNewLocation({ name: "", type: currentLevel, parentId: parentId || "" });
      fetchLocations(parentId, currentLevel);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add location");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Vanish this location zone? This may affect nested hierarchies.")) return;
    try {
      await API.delete(`/locations/${id}`);
      toast.success("Location removed");
      fetchLocations(parentId, currentLevel);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-12 pb-40">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
             {viewStack.length > 0 && (
                <Button variant="ghost" size="icon" onClick={handleNavigateUp} className="rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
                   <ArrowLeft className="size-5" />
                </Button>
             )}
             <h1 className="text-5xl font-black italic tracking-tighter text-white">Location Hub</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">
             <Globe className="size-3" /> Universal Discovery Taxonomy
          </div>
        </div>
        <Button className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 transition-all duration-700" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="size-4 mr-2" /> Add {currentLevel}
        </Button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 overflow-x-auto">
         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 px-4">Registry Path:</span>
         <Button variant="ghost" className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${!parentId ? "bg-indigo-600 text-white" : "text-white/40"}`} onClick={() => { setParentId(null); setCurrentLevel("country"); setViewStack([]); }}>
            World
         </Button>
         {viewStack.map((v, i) => (
           <div key={v._id} className="flex items-center gap-3">
              <ChevronRight className="size-4 text-white/10" />
              <Button variant="ghost" className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest ${i === viewStack.length - 1 ? "bg-indigo-600 text-white" : "text-white/40"}`} onClick={() => {
                 const newStack = viewStack.slice(0, i + 1);
                 setViewStack(newStack);
                 setParentId(v._id);
                 setCurrentLevel(TYPE_ORDER[TYPE_ORDER.indexOf(v.type) + 1]);
              }}>
                 {v.name}
              </Button>
           </div>
         ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-40">
           <Loader2 className="size-12 animate-spin text-indigo-600" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-[#0d0e1b]">
           <MapPin className="size-16 mx-auto mb-6 text-slate-800" />
           <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No {currentLevel} zones registered in this precinct</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((loc) => (
            <Card key={loc._id} className="group relative bg-[#0d0e1b] border-white/5 hover:border-indigo-600/30 rounded-[2.5rem] overflow-hidden transition-all duration-700 border-2 shadow-2xl">
               <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700">
                        {TYPE_ICONS[loc.type]}
                     </div>
                     <Badge className="bg-white/5 text-white/40 font-black px-4 py-1.5 rounded-xl text-[8.5px] uppercase tracking-widest border-white/5">
                        {loc.type}
                     </Badge>
                  </div>

                  <h3 className="text-2xl font-black italic tracking-tighter text-white mb-8 group-hover:translate-x-2 transition-transform duration-700">{loc.name}</h3>

                  <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                     <Button className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white hover:text-black text-white font-black uppercase tracking-widest text-[9px] transition-all duration-700" onClick={() => handleNavigateDown(loc)}>
                        Explore Hub <ArrowLeft className="size-3.5 ml-2 rotate-180" />
                     </Button>
                     <Button variant="ghost" className="size-12 rounded-xl bg-white/5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all" onClick={() => handleDelete(loc._id)}>
                        <Trash2 className="size-4" />
                     </Button>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-[#020617] border-white/5 shadow-3xl rounded-[3rem] p-12 overflow-hidden outline-none">
           <DialogHeader className="text-center mb-10">
              <div className="size-20 rounded-[1.5rem] bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto mb-6">
                 {TYPE_ICONS[currentLevel]}
              </div>
              <DialogTitle className="text-3xl font-black italic tracking-tighter text-white">Pin New Zone</DialogTitle>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Hierarchy Level: {currentLevel}</p>
           </DialogHeader>

           <div className="space-y-6">
              <div className="space-y-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Display Name *</Label>
                 <Input 
                   placeholder={`e.g., ${currentLevel === "country" ? "India" : currentLevel === "state" ? "Telangana" : "Sector 4"}`}
                   value={newLocation.name}
                   onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                   className="h-16 rounded-2xl bg-[#0d0e1b] border-white/5 text-white font-bold px-8 border-2 focus:border-indigo-600/50"
                 />
              </div>

              {parentId && (
                 <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Parent Hierarchy</p>
                    <p className="text-sm font-bold text-white italic">{viewStack[viewStack.length - 1]?.name}</p>
                 </div>
              )}
           </div>

           <DialogFooter className="mt-12 flex-col gap-4">
              <Button className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-600/20 transition-all duration-700" onClick={handleAddLocation}>
                 Verify & Seal Registry
              </Button>
              <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-500 font-black uppercase tracking-[0.2em] text-[9px]" onClick={() => setIsAddDialogOpen(false)}>
                 Cancel
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
