import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { 
  Star, Clock, CheckCircle2, MapPin, 
  ArrowLeft, Sparkles, Home, Building, 
  PartyPopper, ExternalLink, CalendarDays,
  Repeat, Zap, Percent, Info
} from 'lucide-react';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { AppointmentSlotPicker } from '../ui/AppointmentSlotPicker';
import { AvailabilityCalendar } from '../ui/AvailabilityCalendar';
import API from '../../lib/api';
import { toast } from 'sonner';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { triggerSuccessConfetti } from '../../lib/utils/confetti';

export function BookingPage() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [countdown, setCountdown] = useState(5.0);
  const { addView } = useRecentlyViewed();

  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [allSlots, setAllSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('monthly');
  const [customInterval, setCustomInterval] = useState(14);

  const [address, setAddress] = useState({
    full_address: '',
    landmark: '',
    area: '',
    city: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, profileRes] = await Promise.all([
          API.get(`/services/${serviceId}`),
          API.get('/auth/profile').catch(() => ({ data: null }))
        ]);
        
        setService(serviceRes.data);
        addView(serviceRes.data);

        if (profileRes.data?.address && profileRes.data.address.full_address) {
          setAddress(profileRes.data.address);
          setIsAutoFilled(true);
        } else {
          setAddress(prev => ({ ...prev, city: serviceRes.data.location }));
        }

      } catch (error) {
        toast.error('Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  useEffect(() => {
    if (date && service?.provider?._id && step === 2) {
      const fetchSlots = async () => {
        setSlotLoading(true);
        try {
          const dateStr = date.toISOString().split('T')[0];
          // New Route: /api/availability/:providerId/:serviceId/:date
          const { data } = await API.get(`/availability/${service.provider._id}/${serviceId}/${dateStr}`);
          
          if (data.available) {
            setAllSlots(data.slots || []);
            setAvailableSlots(data.availableSlots || []);
          } else {
            setAvailableSlots([]);
            setAllSlots([]);
            toast.info(data.message || "Provider is not available on this date");
          }
        } catch (error) {
          toast.error("Failed to fetch service-specific slots");
        } finally {
          setSlotLoading(false);
        }
      };
      fetchSlots();
    }
  }, [date, service?.provider?._id, step, serviceId]);

  useEffect(() => {
    if (bookingSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => +(prev - 0.1).toFixed(1)), 100);
      return () => clearTimeout(timer);
    } else if (bookingSuccess && countdown <= 0) {
      navigate('/customer/bookings');
    }
  }, [bookingSuccess, countdown, navigate]);

  const handleBooking = async () => {
    if (!date) return toast.error('Please select a date');
    if (!selectedSlot) return toast.error('Please select an appointment time');
    if (!address.full_address || !address.city) return toast.error('Please provide a complete service address');

    setIsBooking(true);
    try {
      await API.post('/bookings', {
        serviceId,
        date,
        appointmentStartTime: selectedSlot,
        time_slot: selectedSlot,
        service_address: address,
        isRecurring,
        recurrenceType,
        recurrenceInterval: recurrenceType === 'custom' ? customInterval : undefined
      });

      setBookingSuccess(true);
      toast.success('Appointment scheduled successfully!');
      triggerSuccessConfetti();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Appointment failed');
    } finally {
       setIsBooking(false);
    }
  };

  const steps = [
    { number: 1, title: 'Date', desc: 'Select your preferred date' },
    { number: 2, title: 'Time', desc: 'Pick an appointment time' },
    { number: 3, title: 'Address', desc: 'Where do you need us?' },
    { number: 4, title: 'Confirm', desc: 'Review and schedule' }
  ];

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
         <Sparkles className="size-6 text-primary animate-spin" />
      </div>
      <p className="font-heading font-black text-xl animate-pulse">Calibrating your session...</p>
    </div>
  );

  if (bookingSuccess) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        key="success-view"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="min-h-[70vh] flex items-center justify-center"
      >
        <Card className="max-w-xl w-full border-none shadow-premium rounded-[3.5rem] bg-card/40 backdrop-blur-2xl p-16 text-center overflow-hidden relative">
           <div className="absolute inset-x-0 -top-20 flex justify-center opacity-20 (pointer-events-none)">
              <div className="size-[400px] bg-primary rounded-full blur-[100px]" />
           </div>
           <div className="size-24 rounded-[2.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-8 mx-auto">
             <CheckCircle2 className="size-12" />
           </div>
           <h2 className="text-4xl font-black mb-4">Service Synchronized!</h2>
           <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto">
             Your appointment has been validated. You can monitor the status in your dashboard.
           </p>
           <Button onClick={() => navigate('/customer/bookings')} className="h-14 px-10 rounded-2xl bg-primary text-white font-black shadow-xl">
             Track Appointment
           </Button>
           <motion.div className="mt-10 h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5.0, ease: "linear" }} className="h-full bg-primary" />
           </motion.div>
           <p className="mt-4 text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Redirecting in {countdown.toFixed(1)}s</p>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-inner">
              <CalendarDays className="size-7" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-black tracking-tight uppercase">Reserve Service</h1>
              <p className="text-muted-foreground font-medium">{service.name} / {service.provider?.name}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl font-black text-muted-foreground hover:text-primary transition-all">
            <ArrowLeft className="size-4 mr-2" /> Cancel Session
          </Button>
        </div>
        
        <div className="mt-12 max-w-2xl mx-auto flex items-center justify-between relative px-2">
           <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary/30 -translate-y-1/2 -z-10 rounded-full" />
           <motion.div initial={{ width: "0%" }} animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} className="absolute (top-1/2) left-0 h-1 bg-primary -translate-y-1/2 -z-10 rounded-full transition-all duration-500" />
           {steps.map((s, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              return (
                 <div key={s.title} className="flex flex-col items-center gap-2">
                    <button onClick={() => step > stepNum && setStep(stepNum)} disabled={step <= stepNum} className={`size-10 rounded-full flex items-center justify-center transition-all duration-300 relative border-2 ${isActive ? 'bg-primary border-primary text-white shadow-glow scale-125' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-card border-border/50 text-muted-foreground'}`}>
                       {isCompleted ? <CheckCircle2 className="size-5" /> : <span className="font-black">{stepNum}</span>}
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-muted-foreground opacity-50'}`}>{s.title}</span>
                 </div>
              );
           })}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-premium rounded-[3rem] bg-card/40 backdrop-blur-xl ring-1 ring-white/10">
                  <CardContent className="p-10">
                    <div className="flex flex-col lg:flex-row gap-10 items-start justify-center">
                      <div className="w-full max-w-md">
                        <AvailabilityCalendar providerId={service.provider._id} serviceId={serviceId!} selectedDate={date} onSelect={(d) => d && setDate(d)} />
                      </div>
                      <div className="space-y-6 max-w-xs pt-8">
                         <h3 className="text-2xl font-black uppercase">Temporal Target</h3>
                         <p className="text-muted-foreground font-medium italic">Selecting available slots for your specific {service.name} environment.</p>
                         <div className="flex flex-wrap gap-2 pt-4">
                            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3 py-1 font-black">SOLO-SYNC</Badge>
                            <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 px-3 py-1 font-black">FAST-FLUX</Badge>
                         </div>
                      </div>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <Button onClick={() => setStep(2)} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-lg group">
                        Enter Timeframe <Clock className="size-5 ml-2 group-hover:rotate-12 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-premium rounded-[3rem] bg-card/40 backdrop-blur-xl ring-1 ring-white/10">
                   <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                      <h3 className="text-2xl font-black uppercase">Operating Slots</h3>
                      <Badge className="rounded-full px-4 py-1.5 font-black uppercase tracking-widest text-[9px] bg-primary/10 text-primary border-none">
                        {date?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Badge>
                   </CardHeader>
                  <CardContent className="p-10">
                    <AppointmentSlotPicker slots={allSlots} availableSlots={availableSlots} bookedSlots={bookedSlots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} loading={slotLoading} />
                    <div className="mt-10 flex justify-between items-center">
                      <Button variant="ghost" onClick={() => setStep(1)} className="h-14 px-6 rounded-2xl font-black text-muted-foreground">Back</Button>
                      <Button disabled={!selectedSlot} onClick={() => setStep(3)} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-lg group">Deploy Location <MapPin className="size-5 ml-2 group-hover:translate-y-1 transition-transform" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-premium rounded-[3rem] bg-card/40 backdrop-blur-xl ring-1 ring-white/10">
                  <CardContent className="p-10">
                    <div className="grid gap-8">
                       <div className="space-y-3 pt-4">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Launch Coordinate (Full Address)</Label>
                          <Input value={address.full_address} onChange={(e) => setAddress({...address, full_address: e.target.value})} placeholder="House / Flat No, Road/Way" className="h-14 px-6 rounded-2xl bg-white/5 border-2 focus:border-primary font-bold text-base" />
                       </div>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Zone (Area)</Label>
                             <Input value={address.area} onChange={(e) => setAddress({...address, area: e.target.value})} className="h-14 px-6 rounded-2xl bg-white/5 border-2" />
                          </div>
                          <div className="space-y-3">
                             <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">City Hub</Label>
                             <Input value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="h-14 px-6 rounded-2xl bg-white/5 border-2" />
                          </div>
                       </div>
                    </div>
                    <div className="mt-10 flex justify-between items-center">
                      <Button variant="ghost" onClick={() => setStep(2)} className="h-14 px-6 rounded-2xl font-black text-muted-foreground">Back</Button>
                      <Button disabled={!address.full_address || !address.city} onClick={() => setStep(4)} className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-lg">Validate Reservation</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-premium rounded-[3rem] bg-card/40 backdrop-blur-xl overflow-hidden ring-1 ring-white/10">
                  <CardContent className="p-10">
                     <div className="flex items-center justify-between p-8 bg-primary/5 rounded-[2.5rem] border border-dashed border-primary/20 mb-8">
                        <div className="flex items-center gap-5">
                           <Zap className={`size-8 ${isRecurring ? 'text-yellow-500 fill-yellow-500 shadow-glow' : 'text-muted-foreground'}`} />
                           <div>
                              <p className="font-black text-xl uppercase italic tracking-tighter">Recurring Flow</p>
                              <p className="text-xs font-bold text-muted-foreground uppercase opacity-60 tracking-widest">Enable 10% Protocol Discount</p>
                           </div>
                        </div>
                        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} className="scale-150" />
                     </div>
                     <AnimatePresence>
                        {isRecurring && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid md:grid-cols-3 gap-4 pb-8">
                                 {['weekly', 'monthly', 'custom'].map((t) => (
                                    <div key={t} onClick={() => setRecurrenceType(t)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${recurrenceType === t ? 'border-primary bg-primary/5' : 'border-white/5 hover:bg-secondary/10'}`}>
                                       <p className="font-black text-base uppercase">{t}</p>
                                    </div>
                                 ))}
                           </motion.div>
                        )}
                     </AnimatePresence>
                     <Button variant="ghost" onClick={() => setStep(3)} className="h-14 px-6 rounded-2xl font-black text-muted-foreground font-black uppercase text-[10px]">Back to Location</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-none shadow-3xl rounded-[3.5rem] bg-slate-950 text-white overflow-hidden ring-1 ring-white/20 p-8 space-y-8">
            <div className="space-y-6">
               <h3 className="text-xl font-black uppercase tracking-widest text-primary italic">Protocol Summary</h3>
               <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/5 pb-3">
                     <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Target Service</span>
                     <span className="font-black">{service.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-3">
                     <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Time Window</span>
                     <span className="font-black text-emerald-400">{selectedSlot || "---"}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                     <span className="text-xl font-black uppercase italic">Total Credits</span>
                     <div className="flex flex-col items-end">
                        {isRecurring && <span className="text-xs text-white/30 line-through">₹{service.price}</span>}
                        <span className="text-4xl font-black text-primary drop-shadow-glow">₹{isRecurring ? Math.round(service.price * 0.9) : service.price}</span>
                     </div>
                  </div>
               </div>
               <Button size="lg" className={`w-full h-20 rounded-[2rem] font-black text-xl shadow-2xl transition-all ${step === 4 ? 'bg-primary text-white hover:scale-[1.02]' : 'bg-white/5 text-white/20'}`} onClick={handleBooking} disabled={isBooking || step !== 4}>
                 {isBooking ? <div className="animate-spin size-6 border-4 border-white/20 border-t-white rounded-full" /> : "Initiate Checkout"}
               </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
