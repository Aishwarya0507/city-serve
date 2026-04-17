import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTheme } from '../../context/ThemeContext';
import API from '../../lib/api';
import { toast } from 'sonner';
import { 
  User, Lock, Palette, Save, Loader2, 
  Check, Moon, Sun, Monitor, ShieldCheck, Mail
} from 'lucide-react';

export function ProfileSettings() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState({
    full_address: '',
    landmark: '',
    area: '',
    city: ''
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            setUserInfo(data);
            setName(data.name || '');
            setEmail(data.email || '');
            if (data.address) {
                setAddress(data.address);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            const savedUser = localStorage.getItem('userInfo');
            if (savedUser) {
              const parsed = JSON.parse(savedUser);
              setUserInfo(parsed);
              setName(parsed.name || '');
              setEmail(parsed.email || '');
            }
        }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.put('/auth/profile', { name, email, address });
      const updatedUser = { ...userInfo, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await API.put('/auth/profile', { password: newPassword });
      toast.success('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-white border-gray-200' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-slate-950 border-slate-800' },
    { id: 'blue', name: 'Ocean Blue', icon: Palette, color: 'bg-blue-600 border-blue-400' },
    { id: 'green', name: 'Emerald', icon: Palette, color: 'bg-emerald-600 border-emerald-400' },
    { id: 'purple', name: 'Royal', icon: Palette, color: 'bg-purple-600 border-purple-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4"
      >
        <h1 className="text-4xl font-heading font-black tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground font-medium mt-1">Manage your profile, security, and appearance</p>
      </motion.div>

      <Tabs defaultValue="profile" className="w-full">
        <div className="px-4 mb-8">
          <TabsList className="bg-secondary/50 p-1.5 rounded-2xl h-14 border w-full max-w-md">
            <TabsTrigger value="profile" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-md transition-all h-full">
              <User className="size-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-md transition-all h-full">
              <Lock className="size-4 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-md transition-all h-full">
              <Palette className="size-4 mr-2" /> Theme
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4">
          <TabsContent value="profile" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <User className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Personal Information</CardTitle>
                      <CardDescription className="font-medium">Update your account details and contact info</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-11 h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold ml-1">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            type="email"
                            className="pl-11 h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-6">
                       <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Save className="size-4" /> Default Service Address
                       </h3>
                       
                       <div className="grid gap-6">
                          <div className="space-y-2">
                             <Label className="text-sm font-bold ml-1">Full Street Address</Label>
                             <Input 
                                value={address.full_address}
                                onChange={(e) => setAddress({ ...address, full_address: e.target.value })}
                                placeholder="Apt 4B, Building 12, Main Street"
                                className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                             />
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">Area / Locality</Label>
                                <Input 
                                   value={address.area}
                                   onChange={(e) => setAddress({ ...address, area: e.target.value })}
                                   placeholder="Sunnyvale"
                                   className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                                />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-sm font-bold ml-1">City</Label>
                                <Input 
                                   value={address.city}
                                   onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                   placeholder="Silicon Valley"
                                   className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                                />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label className="text-sm font-bold ml-1">Landmark (Optional)</Label>
                             <Input 
                                value={address.landmark}
                                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                                placeholder="Near Central Park"
                                className="h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="pt-8">
                      <Button 
                        disabled={loading}
                        className="w-full md:w-auto rounded-xl h-14 px-10 font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {loading ? <Loader2 className="size-5 mr-3 animate-spin" /> : <Save className="size-5 mr-3" />}
                        Save Account Details
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <ShieldCheck className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Security Settings</CardTitle>
                      <CardDescription className="font-medium">Manage your password and account security</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold ml-1">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pl-11 h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold ml-1">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 h-12 rounded-xl bg-background/50 border-2 focus:border-primary transition-all font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        disabled={loading}
                        className="rounded-xl h-12 px-8 font-black bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Lock className="size-4 mr-2" />}
                        Update Password
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-none shadow-premium rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-8 pb-0">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Palette className="size-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black">Theme Selection</CardTitle>
                      <CardDescription className="font-medium">Personalize your interface with custom themes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {themeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id as any)}
                        className={`group relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 ${
                          theme === opt.id 
                            ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                            : 'border-transparent bg-secondary/30'
                        }`}
                      >
                        <div className={`size-12 rounded-2xl ${opt.color} flex items-center justify-center mb-3 shadow-lg`}>
                          <opt.icon className={`size-6 ${theme === opt.id ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <span className={`text-sm font-black transition-colors ${theme === opt.id ? 'text-primary' : ''}`}>
                          {opt.name}
                        </span>
                        {theme === opt.id && (
                          <motion.div 
                            layoutId="active-theme"
                            className="absolute -top-2 -right-2 size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="size-3 stroke-[4px]" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-12 p-6 rounded-[2rem] bg-secondary/20 border border-dashed flex items-center gap-6">
                    <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                       <Monitor className="size-8 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg">System Intelligence</h4>
                      <p className="text-sm text-muted-foreground font-medium">Themes are automatically synced across your devices for a seamless experience.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
