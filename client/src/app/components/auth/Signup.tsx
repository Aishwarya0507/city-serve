import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { UserPlus, MapPin, Loader2, Briefcase, Globe, Landmark, Building2, Home, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { triggerSuccessConfetti } from '../../lib/utils/confetti';
import API from '../../lib/api';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    state: '',
    district: '',
    village: '',
  });

  const [geoData, setGeoData] = useState({
    countries: [],
    states: [],
    districts: [],
    villages: [],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState({
    countries: true,
    states: false,
    districts: false,
    villages: false,
  });
  const [isError, setIsError] = useState(false);

  // Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const { data } = await API.get('/locations?type=country');
        setGeoData(prev => ({ ...prev, countries: data }));
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setFetching(prev => ({ ...prev, countries: false }));
      }
    };
    fetchCountries();
  }, []);

  // Cascade Fetching
  const handleCountryChange = async (val: string) => {
    setFormData({ ...formData, country: val, state: '', district: '', village: '' });
    setFetching(prev => ({ ...prev, states: true }));
    try {
      const selected = geoData.countries.find((c: any) => c.name === val);
      const { data } = await API.get(`/locations?parentId=${selected._id}`);
      setGeoData(prev => ({ ...prev, states: data, districts: [], villages: [] }));
    } catch (error) {} finally { setFetching(prev => ({ ...prev, states: false })); }
  };

  const handleStateChange = async (val: string) => {
    setFormData({ ...formData, state: val, district: '', village: '' });
    setFetching(prev => ({ ...prev, districts: true }));
    try {
      const selected = geoData.states.find((s: any) => s.name === val);
      const { data } = await API.get(`/locations?parentId=${selected._id}`);
      setGeoData(prev => ({ ...prev, districts: data, villages: [] }));
    } catch (error) {} finally { setFetching(prev => ({ ...prev, districts: false })); }
  };

  const handleDistrictChange = async (val: string) => {
    setFormData({ ...formData, district: val, village: '' });
    setFetching(prev => ({ ...prev, villages: true }));
    try {
      const selected = geoData.districts.find((d: any) => d.name === val);
      const { data } = await API.get(`/locations?parentId=${selected._id}`);
      setGeoData(prev => ({ ...prev, villages: data }));
    } catch (error) {} finally { setFetching(prev => ({ ...prev, villages: false })); }
  };

  const handleSignup = async (role: 'customer' | 'provider') => {
    if (!formData.name || !formData.email || !formData.password || !formData.country || !formData.state) {
      toast.error('Complete your professional identity and location registry');
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Security keys do not match');
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role === 'customer' ? 'user' : 'provider',
        country: formData.country,
        state: formData.state,
        district: formData.district,
        village: formData.village
      };

      const { data } = await API.post('/auth/signup', payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Store most granular location for dashboard filtering
      localStorage.setItem('selectedLocation', formData.village || formData.district || formData.state);
      
      toast.success('Professional Identity Sealed');
      triggerSuccessConfetti();
      setTimeout(() => navigate(`/${role}`), 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registry failed');
      setIsError(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 size-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 size-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter text-indigo-500 mb-2">CityServe</h1>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Universal Professional Marketplace</p>
        </div>

        <Card className={`bg-slate-950/40 backdrop-blur-3xl border-white/5 rounded-[3.5rem] shadow-3xl overflow-hidden transition-all duration-300 ${isError ? 'animate-shake border-red-500/30' : ''}`}>
          <CardContent className="p-12">
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-12 bg-white/5 rounded-2xl p-1.5 h-16">
                <TabsTrigger value="customer" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-500">Individual</TabsTrigger>
                <TabsTrigger value="provider" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all duration-500">Provider</TabsTrigger>
              </TabsList>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Identity / Title</Label>
                      <Input placeholder="John Doe / Elite Services" className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6 border-2 focus:border-indigo-600/50" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Communication Hub (Email)</Label>
                      <Input type="email" placeholder="you@domain.com" className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6 border-2 focus:border-indigo-600/50" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
                         <MapPin className="size-3" /> Geo-Discovery Hub
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <Select value={formData.country} onValueChange={handleCountryChange}>
                            <SelectTrigger className="h-12 rounded-xl bg-black/40 border-white/5 text-[11px] font-bold text-white px-4">
                               {fetching.countries ? <Loader2 className="animate-spin size-3" /> : <SelectValue placeholder="Country" />}
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                               {geoData.countries.map((c: any) => <SelectItem key={c._id} value={c.name} className="font-bold text-white py-3">{c.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         <Select value={formData.state} onValueChange={handleStateChange} disabled={!formData.country}>
                            <SelectTrigger className="h-12 rounded-xl bg-black/40 border-white/5 text-[11px] font-bold text-white px-4 disabled:opacity-20">
                               {fetching.states ? <Loader2 className="animate-spin size-3" /> : <SelectValue placeholder="State" />}
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                               {geoData.states.map((s: any) => <SelectItem key={s._id} value={s.name} className="font-bold text-white py-3">{s.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.state}>
                            <SelectTrigger className="h-12 rounded-xl bg-black/40 border-white/5 text-[11px] font-bold text-white px-4 disabled:opacity-20">
                               {fetching.districts ? <Loader2 className="animate-spin size-3" /> : <SelectValue placeholder="District" />}
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                               {geoData.districts.map((d: any) => <SelectItem key={d._id} value={d.name} className="font-bold text-white py-3">{d.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                         <Select value={formData.village} onValueChange={(v) => setFormData({...formData, village: v})} disabled={!formData.district}>
                            <SelectTrigger className="h-12 rounded-xl bg-black/40 border-white/5 text-[11px] font-bold text-white px-4 disabled:opacity-20">
                               {fetching.villages ? <Loader2 className="animate-spin size-3" /> : <SelectValue placeholder="Village" />}
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 rounded-xl">
                               {geoData.villages.map((v: any) => <SelectItem key={v._id} value={v.name} className="font-bold text-white py-3">{v.name}</SelectItem>)}
                            </SelectContent>
                         </Select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Security Key</Label>
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6 border-2 focus:border-indigo-600/50" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Confirm Key</Label>
                    <Input type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-white/5 border-white/5 text-white font-bold px-6 border-2 focus:border-indigo-600/50" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                 </div>
              </div>

              <TabsContent value="customer" className="mt-0">
                <Button className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all duration-700" onClick={() => handleSignup('customer')} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin size-6" /> : <><UserPlus className="mr-3 size-5" /> Initialize Private Profile</>}
                </Button>
              </TabsContent>
              <TabsContent value="provider" className="mt-0">
                <Button className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all duration-700" onClick={() => handleSignup('provider')} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin size-6" /> : <><Briefcase className="mr-3 size-5" /> Launch Professional Agency</>}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-12 text-center pt-8 border-t border-white/5">
              <p className="text-sm font-medium text-slate-500">
                Recognized Member? 
                <button onClick={() => navigate('/login')} className="text-indigo-500 hover:underline font-black italic ml-2">Sign in to Console</button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
