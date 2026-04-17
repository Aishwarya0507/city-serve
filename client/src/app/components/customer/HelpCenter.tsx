import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Search, MessageCircle, ShieldCheck, Zap, 
  ChevronDown, ThumbsUp, ThumbsDown, 
  ArrowRight, Phone, Mail, HelpCircle,
  FileText, Plus, Loader2
} from 'lucide-react';
import API from '../../lib/api';
import { useDebounce } from '../../hooks/useDebounce';
import { toast } from 'sonner';

const categoryItems = [
  { id: 'user', name: 'User Help', icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Bookings, payments, and account support' },
  { id: 'provider', name: 'Provider Help', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Listings, schedule, and payout support' },
  { id: 'general', name: 'General', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Policies, safety, and platform basics' },
];

export function HelpCenter() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, boolean>>({});
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [faqsRes, configRes] = await Promise.all([
          API.get('/faqs'),
          API.get('/faqs/config')
        ]);
        setFaqs(faqsRes.data);
        setConfig(configRes.data);
        
        // Load feedback from local storage
        const savedFeedback = localStorage.getItem('faqFeedback');
        if (savedFeedback) setFeedbackGiven(JSON.parse(savedFeedback));
      } catch (error) {
        console.error('Error fetching help data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const searchFaqs = async () => {
      if (!debouncedSearch && !activeCategory) {
          const { data } = await API.get('/faqs');
          setFaqs(data);
          return;
      }
      
      try {
        const { data } = await API.get(`/faqs?search=${debouncedSearch}${activeCategory ? `&role=${activeCategory}` : ''}`);
        setFaqs(data);
        if (debouncedSearch && resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };
    searchFaqs();
  }, [debouncedSearch, activeCategory]);

  const handleFeedback = async (id: string, type: 'yes' | 'no') => {
    if (feedbackGiven[id]) return;
    
    try {
      await API.post(`/faqs/${id}/feedback`, { type });
      const newFeedback = { ...feedbackGiven, [id]: true };
      setFeedbackGiven(newFeedback);
      localStorage.setItem('faqFeedback', JSON.stringify(newFeedback));
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const categories = activeCategory 
    ? categoryItems.filter(c => c.id === activeCategory)
    : categoryItems;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero Section */}
      <section className="relative h-[450px] rounded-[3rem] flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 size-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 size-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-3xl"
        >
          <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tighter text-white mb-8">
            How can we <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">help you?</span>
          </h1>
          
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-3xl" />
            <div className="relative flex items-center bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl h-16 px-6 focus-within:border-primary transition-all">
              <Search className="size-6 text-white/40 mr-4" />
              <input 
                type="text"
                placeholder="Search for articles, questions, or issues..."
                className="bg-transparent border-none text-white w-full h-full focus:outline-none font-medium placeholder:text-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="text-white/40 hover:text-white font-black text-xs uppercase tracking-widest mr-2">Clear</button>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Grid */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {categoryItems.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`group cursor-pointer border-none shadow-none rounded-[2.5rem] transition-all duration-500 ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-primary-foreground shadow-glow scale-105' 
                    : 'bg-card hover:bg-white dark:hover:bg-black/40 hover:shadow-premium'
                }`}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              >
                <CardContent className="p-10 flex flex-col items-center text-center">
                  <div className={`size-16 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12 duration-500 ${
                    activeCategory === cat.id ? 'bg-white/20' : cat.bg
                  }`}>
                    <cat.icon className={`size-8 ${activeCategory === cat.id ? 'text-white' : cat.color}`} />
                  </div>
                  <h3 className="text-xl font-black mb-2">{cat.name}</h3>
                  <p className={`text-sm font-medium ${activeCategory === cat.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {cat.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={resultsRef} className="max-w-4xl mx-auto px-6 space-y-10">
        <div className="flex items-center justify-between border-b pb-6">
           <h2 className="text-3xl font-heading font-black tracking-tight">
             {debouncedSearch ? 'Search Results' : activeCategory ? `${categoryItems.find(c => c.id === activeCategory)?.name} FAQs` : 'Common Questions'}
           </h2>
           <Badge variant="outline" className="rounded-lg h-7 px-3 font-black text-[10px] uppercase tracking-widest">
             {faqs.length} Articles
           </Badge>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-secondary/30 animate-pulse rounded-2xl" />)}
          </div>
        ) : faqs.length === 0 ? (
          <div className="py-20 text-center">
             <div className="size-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="size-10 text-muted-foreground" />
             </div>
             <h3 className="text-2xl font-black mb-2">No results found</h3>
             <p className="text-muted-foreground font-medium">Try different keywords or browse categories above.</p>
             <Button variant="ghost" className="mt-6 font-bold" onClick={() => { setSearchTerm(''); setActiveCategory(null); }}>See all FAQs</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`border-none rounded-3xl transition-all duration-300 ${
                  expandedId === faq._id ? 'bg-white dark:bg-black/40 shadow-premium' : 'bg-secondary/30'
                }`}>
                  <button 
                    className="w-full text-left p-6 md:p-8 outline-none"
                    onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                  >
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${faq.is_highlighted ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                             {faq.is_highlighted ? <Zap className="size-4 fill-amber-500" /> : <FileText className="size-4" />}
                          </div>
                          <span className={`text-lg font-black tracking-tight transition-colors ${expandedId === faq._id ? 'text-primary' : ''}`}>
                            {faq.question}
                          </span>
                       </div>
                       <ChevronDown className={`size-5 transition-transform duration-300 ${expandedId === faq._id ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
                    </div>

                    <AnimatePresence>
                      {expandedId === faq._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-8 pb-4">
                             <p className="text-muted-foreground leading-relaxed font-medium text-lg border-l-4 border-primary/20 pl-6">
                               {faq.answer}
                             </p>
                             
                             <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-secondary/40 border border-white/10">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Was this helpful?</span>
                                <div className="flex gap-4">
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className={`rounded-xl px-6 h-10 font-bold transition-all ${feedbackGiven[faq._id] ? 'opacity-50 grayscale' : 'hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50'}`}
                                     onClick={(e) => { e.stopPropagation(); handleFeedback(faq._id, 'yes'); }}
                                     disabled={feedbackGiven[faq._id]}
                                   >
                                      <ThumbsUp className="size-4 mr-2" /> Yes
                                   </Button>
                                   <Button 
                                     variant="outline" 
                                     size="sm" 
                                     className={`rounded-xl px-6 h-10 font-bold transition-all ${feedbackGiven[faq._id] ? 'opacity-50 grayscale' : 'hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50'}`}
                                     onClick={(e) => { e.stopPropagation(); handleFeedback(faq._id, 'no'); }}
                                     disabled={feedbackGiven[faq._id]}
                                   >
                                      <ThumbsDown className="size-4 mr-2" /> No
                                   </Button>
                                </div>
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Support Section */}
      <section className="max-w-6xl mx-auto px-6">
         <div className="relative rounded-[3rem] bg-primary text-primary-foreground p-12 md:p-20 overflow-hidden shadow-glow">
            <div className="absolute right-0 bottom-0 opacity-10 blur-3xl size-64 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            <div className="absolute left-0 top-0 opacity-5 blur-3xl size-96 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="text-center md:text-left space-y-4">
                  <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight leading-tight">Still need help?</h2>
                  <p className="text-primary-foreground/70 font-medium text-lg max-w-md">Our support team is available 24/7 to resolve your issues and answer your questions.</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                  <a href={`mailto:${config?.contact_email || 'support@cityserve.com'}`} className="block">
                    <Card className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white transition-all p-8 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer h-full">
                       <Mail className="size-8 mb-4 group-hover:scale-110 transition-transform" />
                       <h4 className="font-black text-lg">Contact Support</h4>
                       <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">{config?.contact_email || 'support@cityserve.com'}</p>
                    </Card>
                  </a>
                  <a href={config?.support_request_link || '#'} target="_blank" rel="noopener noreferrer" className="block">
                    <Card className="bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md text-white transition-all p-8 rounded-[2rem] flex flex-col items-center text-center group cursor-pointer h-full">
                       <Plus className="size-8 mb-4 group-hover:scale-110 transition-transform" />
                       <h4 className="font-black text-lg">Raise a Request</h4>
                       <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">Priority Ticketing</p>
                    </Card>
                  </a>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: any) {
  const variants: any = {
    default: "bg-primary text-primary-foreground",
    outline: "border border-border bg-transparent text-foreground",
  };
  return (
    <span className={`inline-flex items-center justify-center font-bold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
