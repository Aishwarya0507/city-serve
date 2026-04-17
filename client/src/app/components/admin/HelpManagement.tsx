import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Plus, Edit2, Trash2, Save, X, Search, 
  HelpCircle, Settings, Mail, Phone, ExternalLink,
  ChevronRight, BadgeCheck, Zap, MoreVertical,
  Loader2, Filter
} from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';

export function HelpManagement() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    contact_email: '',
    contact_phone: '',
    support_request_link: ''
  });
  const [loading, setLoading] = useState(true);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [role, setRole] = useState('general');
  const [category, setCategory] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faqsRes, configRes] = await Promise.all([
        API.get('/faqs'),
        API.get('/faqs/config')
      ]);
      setFaqs(faqsRes.data);
      setConfig(configRes.data);
    } catch (error) {
      toast.error('Failed to fetch help center data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { question, answer, role, category, is_highlighted: isHighlighted };
    
    try {
      if (editingFaq) {
        await API.put(`/faqs/admin/${editingFaq._id}`, payload);
        toast.success('FAQ updated successfully');
      } else {
        await API.post('/faqs/admin', payload);
        toast.success('FAQ created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await API.delete(`/faqs/admin/${id}`);
      toast.success('FAQ deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put('/faqs/admin/config', config);
      toast.success('Support configuration updated');
      setIsEditingConfig(false);
    } catch (error) {
      toast.error('Failed to update configuration');
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setRole('general');
    setCategory('');
    setIsHighlighted(false);
  };

  const startEdit = (faq: any) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setRole(faq.role);
    setCategory(faq.category);
    setIsHighlighted(faq.is_highlighted);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight">Help Center Control</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage FAQs, feedback, and support contact details</p>
        </div>
        <div className="flex gap-4">
           <Button 
            className="rounded-[1rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 h-12 shadow-lg shadow-indigo-600/20"
            onClick={() => { resetForm(); setShowAddModal(true); }}
           >
             <Plus className="size-5 mr-2" /> Add New FAQ
           </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Support Settings */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none shadow-premium rounded-[2rem] overflow-hidden bg-card/60 backdrop-blur-xl ring-1 ring-white/10">
              <CardHeader className="p-8 pb-4">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black">Support Links</CardTitle>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setIsEditingConfig(!isEditingConfig)}>
                       <Settings className="size-4" />
                    </Button>
                 </div>
                 <CardDescription className="font-medium">Information shown in Help Center footer</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                 <form onSubmit={handleUpdateConfig} className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Support Email</Label>
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                            value={config.contact_email}
                            onChange={(e) => setConfig({...config, contact_email: e.target.value})}
                            disabled={!isEditingConfig}
                            className="h-12 pl-11 rounded-xl bg-background/50 border-2 font-bold"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Support Phone</Label>
                       <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                            value={config.contact_phone}
                            onChange={(e) => setConfig({...config, contact_phone: e.target.value})}
                            disabled={!isEditingConfig}
                            className="h-12 pl-11 rounded-xl bg-background/50 border-2 font-bold"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Request Form Link</Label>
                       <div className="relative">
                          <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                            value={config.support_request_link}
                            onChange={(e) => setConfig({...config, support_request_link: e.target.value})}
                            disabled={!isEditingConfig}
                            className="h-12 pl-11 rounded-xl bg-background/50 border-2 font-bold"
                          />
                       </div>
                    </div>
                    
                    {isEditingConfig && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <Button type="submit" className="w-full rounded-xl bg-primary text-white font-black h-12 shadow-lg shadow-primary/20">
                             <Save className="size-4 mr-2" /> Update Configuration
                          </Button>
                       </motion.div>
                    )}
                 </form>
              </CardContent>
           </Card>

           <Card className="border-none shadow-premium rounded-[2rem] overflow-hidden bg-primary text-primary-foreground">
              <CardContent className="p-8">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center">
                       <Zap className="size-6" />
                    </div>
                    <h3 className="text-xl font-black">Help Statistics</h3>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold opacity-80">
                       <span>Total Articles</span>
                       <span>{faqs.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold opacity-80">
                       <span>Helpful Ratings</span>
                       <span>{faqs.reduce((acc, f) => acc + (f.feedback?.yes || 0), 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold opacity-80">
                       <span>Unhelpful Ratings</span>
                       <span>{faqs.reduce((acc, f) => acc + (f.feedback?.no || 0), 0)}</span>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* FAQ Management Table */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-none shadow-premium rounded-[2.5rem] bg-card/60 backdrop-blur-xl ring-1 ring-white/10 overflow-hidden">
              <div className="p-8 border-b flex items-center justify-between">
                 <div className="flex items-center gap-4 flex-1">
                    <Search className="size-5 text-muted-foreground" />
                    <Input placeholder="Search within FAQs..." className="border-none bg-transparent shadow-none font-bold text-lg w-full focus-visible:ring-0" />
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl"><Filter className="size-4" /></Button>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                    <thead>
                       <tr className="border-b bg-secondary/20">
                          <th className="p-6 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Question</th>
                          <th className="p-6 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Target Role</th>
                          <th className="p-6 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Category</th>
                          <th className="p-6 text-left text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                          <th className="p-6 text-right"></th>
                       </tr>
                    </thead>
                    <tbody>
                       {loading ? (
                          <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="size-10 animate-spin text-primary mx-auto" /></td></tr>
                       ) : faqs.length === 0 ? (
                          <tr><td colSpan={5} className="p-20 text-center font-bold text-muted-foreground">No FAQs available yet.</td></tr>
                       ) : (
                          faqs.map((faq) => (
                             <tr key={faq._id} className="border-b hover:bg-secondary/10 transition-colors group">
                                <td className="p-6">
                                   <div className="space-y-1">
                                      <p className="font-black tracking-tight">{faq.question}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-xs">{faq.answer}</p>
                                   </div>
                                </td>
                                <td className="p-6">
                                   <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                      faq.role === 'provider' ? 'bg-emerald-500/10 text-emerald-600' : 
                                      faq.role === 'user' ? 'bg-blue-500/10 text-blue-600' : 
                                      'bg-secondary text-muted-foreground'
                                   }`}>
                                      {faq.role}
                                   </span>
                                </td>
                                <td className="p-6 text-sm font-bold text-muted-foreground">{faq.category}</td>
                                <td className="p-6">
                                   {faq.is_highlighted && (
                                      <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-600">
                                         <Zap className="size-3 fill-amber-500" /> HIGHLIGHTED
                                      </span>
                                   )}
                                </td>
                                <td className="p-6 text-right">
                                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600" onClick={() => startEdit(faq)}>
                                         <Edit2 className="size-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-rose-500/10 hover:text-rose-600" onClick={() => handleDeleteFaq(faq._id)}>
                                         <Trash2 className="size-4" />
                                      </Button>
                                   </div>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
         {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
               <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-2xl bg-card rounded-[3rem] shadow-premium overflow-hidden border ring-1 ring-white/10"
               >
                  <div className="p-10">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h2 className="text-3xl font-heading font-black">{editingFaq ? 'Modify FAQ' : 'New Library Article'}</h2>
                           <p className="text-muted-foreground font-medium">Create detailed answers for common questions</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-2xl size-12" onClick={resetForm}><X className="size-6" /></Button>
                     </div>

                     <form onSubmit={handleSaveFaq} className="space-y-8">
                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Question Text</Label>
                           <Input 
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              placeholder="e.g. How do I track my booking?"
                              className="h-14 rounded-2xl bg-background/50 border-2 font-bold text-lg"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Answer Content</Label>
                           <textarea 
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              placeholder="Provide a detailed explanation..."
                              className="w-full min-h-[160px] p-6 rounded-3xl bg-background/50 border-2 font-medium focus:outline-none focus:border-primary transition-all resize-none"
                              required
                           />
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Target Account Role</Label>
                              <select 
                                 value={role}
                                 onChange={(e) => setRole(e.target.value)}
                                 className="w-full h-14 px-6 rounded-2xl bg-background/50 border-2 font-bold focus:outline-none focus:border-primary transition-all appearance-none"
                              >
                                 <option value="user">User</option>
                                 <option value="provider">Provider</option>
                                 <option value="general">General</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-black uppercase text-muted-foreground ml-1">Category Label</Label>
                              <Input 
                                 value={category}
                                 onChange={(e) => setCategory(e.target.value)}
                                 placeholder="e.g. Payments"
                                 className="h-14 rounded-2xl bg-background/50 border-2 font-bold"
                                 required
                              />
                           </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
                           <input 
                              type="checkbox"
                              id="highlight"
                              checked={isHighlighted}
                              onChange={(e) => setIsHighlighted(e.target.checked)}
                              className="size-6 rounded-lg accent-primary"
                           />
                           <Label htmlFor="highlight" className="font-black text-amber-700 dark:text-amber-400 cursor-pointer">Highlight this article (appears at top of list)</Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                           <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black text-lg border-2" onClick={resetForm}>Discard</Button>
                           <Button type="submit" className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all">
                              {editingFaq ? 'Update Article' : 'Publish Article'}
                           </Button>
                        </div>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
