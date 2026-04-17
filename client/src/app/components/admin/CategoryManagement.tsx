import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Plus, Loader2, FolderTree, Pencil, Trash2, ChevronDown, ChevronRight, Layers, LayoutGrid, X, Power, PowerOff, Image as ImageIcon, UploadCloud } from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';

export function CategoryManagement() {
  const [categories, setCategories] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  // Category Modals
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', description: '' });

  // Sub-Service Modals
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [editingSub, setEditingSub] = useState<any>(null);
  const [subForm, setSubForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/categories/all');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubServices = async (categoryId: string) => {
    try {
      const { data } = await API.get(`/subservices/category/${categoryId}`);
      setSubServices(prev => ({ ...prev, [categoryId]: data }));
    } catch (error) {
      console.error('Error fetching sub-services:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCategoryForm(prev => ({ ...prev, image: data.image }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return toast.error('Category name is required');
    try {
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, categoryForm);
        toast.success('Category updated');
      } else {
        await API.post('/categories', categoryForm);
        toast.success('Category created');
      }
      setIsCategoryDialogOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleSaveSubService = async () => {
    if (!subForm.name.trim() || !activeCategoryId) return toast.error('Name is required');
    try {
      if (editingSub) {
        await API.put(`/subservices/${editingSub._id}`, subForm);
        toast.success('Sub-service updated');
      } else {
        await API.post('/subservices', { ...subForm, categoryId: activeCategoryId });
        toast.success('Sub-service added');
      }
      setIsSubDialogOpen(false);
      fetchSubServices(activeCategoryId);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Warning: This will remove the category. Proceed?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleDeleteSub = async (id: string, categoryId: string) => {
     if (!confirm('Remove this sub-service?')) return;
     try {
       await API.delete(`/subservices/${id}`);
       toast.success('Sub-service removed');
       fetchSubServices(categoryId);
     } catch (error) {
       toast.error('Delete failed');
     }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex items-start justify-between px-2 pt-8"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-heading font-black tracking-tight text-white italic">Category Studio</h1>
          <p className="text-slate-500 font-bold text-sm tracking-wide">Multi-Level Marketplace Taxonomy</p>
        </div>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 px-8 py-7 uppercase tracking-widest text-[10px]" 
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', image: '', description: '' });
            setIsCategoryDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Launch Pillar
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center p-24">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category._id} className="space-y-4">
               <motion.div layout className="group relative">
                  <Card 
                    className="h-[320px] bg-[#0d0e1b] border-white/5 hover:border-indigo-500/30 transition-all duration-500 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-0 cursor-pointer overflow-hidden shadow-2xl relative"
                  >
                     <div className="absolute inset-x-0 -top-10 h-32 bg-indigo-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     
                     {/* Category Header Image */}
                     <div className="absolute inset-0 z-0">
                        {category.image ? (
                           <img src={`http://localhost:5000${category.image}`} className="w-full h-full object-cover opacity-10 group-hover:opacity-30 transition-all duration-1000" />
                        ) : (
                           <div className="w-full h-full bg-indigo-600/5" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1b] to-transparent" />
                     </div>

                     <div className="relative z-10 p-8 flex flex-col items-center">
                        <div className="size-20 rounded-3xl bg-[#0a0b1e] border-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all duration-500 overflow-hidden border">
                          {category.image ? <img src={`http://localhost:5000${category.image}`} className="w-full h-full object-cover" /> : <ImageIcon className="size-8 text-slate-800" />}
                        </div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter mb-4">{category.name}</h3>
                        
                        <div className="flex gap-2">
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             className="rounded-xl font-black uppercase tracking-widest text-[8px] bg-white/5 hover:bg-white hover:text-black transition-all"
                             onClick={() => {
                               setEditingCategory(category);
                               setCategoryForm({ name: category.name, image: category.image || '', description: category.description || "" });
                               setIsCategoryDialogOpen(true);
                             }}
                           >
                             Modify
                           </Button>
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             className="rounded-xl font-black uppercase tracking-widest text-[8px] bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all"
                             onClick={() => {
                               setExpandedCategory(expandedCategory === category._id ? null : category._id);
                               fetchSubServices(category._id);
                             }}
                           >
                             {expandedCategory === category._id ? "Collapse" : "Sub-Services"}
                           </Button>
                        </div>
                     </div>

                     <Button 
                       size="icon" 
                       variant="ghost" 
                       className="absolute top-6 right-6 z-20 size-10 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                       onClick={() => handleDeleteCategory(category._id)}
                     >
                       <Trash2 className="size-4" />
                     </Button>
                  </Card>
               </motion.div>

               <AnimatePresence>
                 {expandedCategory === category._id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-3 px-2"
                    >
                       <Button 
                         variant="ghost"
                         className="w-full h-12 rounded-xl border border-dashed border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 group"
                         onClick={() => {
                           setActiveCategoryId(category._id);
                           setEditingSub(null);
                           setSubForm({ name: '', description: '' });
                           setIsSubDialogOpen(true);
                         }}
                       >
                         <Plus className="size-3 mr-2 group-hover:scale-125 transition-transform" /> Add Sub-Service
                       </Button>

                       {(subServices[category._id] || []).map(sub => (
                          <div key={sub._id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group/sub">
                             <div className="flex items-center gap-3">
                                <div className="size-2 rounded-full bg-indigo-500 shadow-glow" />
                                <span className="font-bold text-xs text-white uppercase tracking-tight">{sub.name}</span>
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                <button className="p-2 hover:text-white text-slate-500" onClick={() => {
                                   setActiveCategoryId(category._id);
                                   setEditingSub(sub);
                                   setSubForm({ name: sub.name, description: sub.description || '' });
                                   setIsSubDialogOpen(true);
                                }}><Pencil className="size-3" /></button>
                                <button className="p-2 hover:text-red-500 text-slate-500" onClick={() => handleDeleteSub(sub._id, category._id)}><Trash2 className="size-3" /></button>
                             </div>
                          </div>
                       ))}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#020617] border-white/5 shadow-3xl rounded-[3rem] p-0 overflow-hidden outline-none">
          <div className="relative p-12 pt-16">
             <button 
               onClick={() => setIsCategoryDialogOpen(false)}
               className="absolute top-8 right-8 z-50 size-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border-0 outline-none"
             >
                <X className="size-4" />
             </button>

             <div className="flex flex-col items-center text-center">
                <label className="size-40 rounded-[2.5rem] bg-[#0d0e1b] border border-white/5 flex items-center justify-center mb-8 shadow-2xl overflow-hidden relative group cursor-pointer transition-all hover:border-indigo-500/30">
                   <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                   <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 gap-2">
                      <UploadCloud className="size-8 text-white" />
                   </div>
                   {uploading ? (
                      <Loader2 className="size-8 animate-spin text-indigo-600" />
                   ) : categoryForm.image ? (
                      <img src={`http://localhost:5000${categoryForm.image}`} className="w-full h-full object-cover" />
                   ) : (
                      <div className="text-slate-800 flex flex-col items-center gap-3">
                         <ImageIcon className="size-10" />
                         <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Add Image</span>
                      </div>
                   )}
                </label>
                <h2 className="text-3xl font-black text-white italic tracking-tighter mb-3">
                   {editingCategory ? 'Modify Pillar' : 'Launch Pillar'}
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-10">Main Category Entry</p>
             </div>

             <div className="space-y-6">
                <div className="space-y-3">
                   <Label className="text-slate-500 font-black text-[9px] uppercase tracking-widest ml-1">Pillar Name *</Label>
                   <Input 
                     placeholder="e.g., Medical Specialists" 
                     className="h-16 rounded-2xl bg-[#0d0e1b] border-white/5 text-white font-bold px-6 focus:border-indigo-600/50 border-2"
                     value={categoryForm.name} 
                     onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} 
                   />
                </div>
                <div className="flex flex-col gap-3 pt-6">
                   <Button 
                     className="h-20 rounded-[1.5rem] bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-[10px] shadow-glow transition-all duration-700"
                     onClick={handleSaveCategory}
                   >
                     {editingCategory ? 'Update Taxonomy' : 'Launch Pillar'}
                   </Button>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-Service Modal */}
      <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-[#020617] border-white/5 shadow-3xl rounded-[2.5rem] p-0 overflow-hidden outline-none">
           <div className="p-10 space-y-10">
              <div className="text-center">
                 <div className="size-16 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-6 mx-auto">
                    <Layers className="size-7" />
                 </div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">
                    {editingSub ? "Update Sub-Service" : "Add Service Entry"}
                 </h2>
                 <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[8px]">Refining The Taxonomy</p>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <Label className="text-slate-500 font-black text-[9px] uppercase tracking-widest ml-1">Service Title *</Label>
                    <Input 
                      placeholder="e.g., General Dentist"
                      className="h-14 rounded-2xl bg-[#0d0e1b] border-white/5 text-white font-bold px-6 border-2 focus:border-indigo-600/50"
                      value={subForm.name}
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-slate-500 font-black text-[9px] uppercase tracking-widest ml-1">Brief Summary</Label>
                    <Textarea 
                      rows={3}
                      placeholder="Specialized root canal treatment..."
                      className="rounded-2xl bg-[#0d0e1b] border-white/5 text-white font-medium p-6 border-2 focus:border-indigo-600/50"
                      value={subForm.description}
                      onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                    />
                 </div>
              </div>

              <div className="flex flex-col gap-3">
                 <Button 
                   className="h-16 rounded-[1.2rem] bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-[9px] transition-all duration-700 shadow-glow"
                   onClick={handleSaveSubService}
                 >
                   Save Sub-Service
                 </Button>
                 <Button variant="ghost" className="h-12 text-slate-500 font-black uppercase tracking-widest text-[8px]" onClick={() => setIsSubDialogOpen(false)}>Cancel</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
