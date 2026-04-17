import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LogIn, Shield, User, Hammer, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { triggerSuccessConfetti } from '../../lib/utils/confetti';
import API from '../../lib/api';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider' | 'admin'>('customer');
  const [isError, setIsError] = useState(false);

  const handleLogin = async (role: 'customer' | 'provider' | 'admin') => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
      return;
    }

    setLoading(true);
    setIsError(false);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const { data } = await API.post('/auth/login', { email: normalizedEmail, password });
      
      const roleMapping: Record<string, string> = {
        'user': 'customer',
        'provider': 'provider',
        'admin': 'admin'
      };

      const mappedRole = roleMapping[data.role];

      if (mappedRole !== role) {
          toast.error(`Account unauthorized. You are trying to login as ${role.toUpperCase()}, but this account is registered as ${data.role.toUpperCase()}.`, {
            description: "Please select the correct tab above.",
            duration: 5000
          });
          setIsError(true);
          setLoading(false);
          setTimeout(() => setIsError(false), 500);
          return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success(`Welcome back, ${data.name}!`);
      triggerSuccessConfetti();
      
      setTimeout(() => {
        navigate(`/${mappedRole}`);
      }, 800);
    } catch (error: any) {
      console.error('Login Error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      setIsError(true);
      setTimeout(() => setIsError(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10">
          <motion.div
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-widest mb-4 border border-primary/20"
          >
             <Shield className="size-3" /> Secure Access
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-heading font-black tracking-tight mb-3"
          >
            City<span className="text-primary">Serve</span>
          </motion.h1>
          <p className="text-muted-foreground font-medium text-lg">Premium Home Service Solutions</p>
        </div>

        <Card className={`border bg-card/40 backdrop-blur-2xl shadow-premium rounded-[2.5rem] overflow-hidden transition-all duration-300 ${isError ? 'animate-shake border-destructive/50' : ''}`}>
          <CardHeader className="pb-4 pt-10 px-10">
            <CardTitle className="text-3xl font-heading font-black">Welcome Back</CardTitle>
            <CardDescription className="text-base font-medium">Please enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-4">
            <Tabs 
              defaultValue="customer" 
              className="w-full"
              onValueChange={(v) => setSelectedRole(v as any)}
            >
              <TabsList className="grid w-full grid-cols-3 mb-10 h-14 bg-secondary/50 p-1.5 rounded-2xl border">
                <TabsTrigger value="customer" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-lg dark:data-[state=active]:text-primary h-full">User</TabsTrigger>
                <TabsTrigger value="provider" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-lg dark:data-[state=active]:text-primary h-full">Provider</TabsTrigger>
                <TabsTrigger value="admin" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-lg dark:data-[state=active]:text-primary h-full">Admin</TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-black uppercase tracking-tighter text-muted-foreground ml-1">Email Address</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="h-14 pl-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-medium text-base transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Password</Label>
                    <button className="text-xs font-bold text-primary hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 pl-12 rounded-2xl bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-medium text-base transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleLogin(selectedRole)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin size-5" />
                  ) : (
                    <>Sign In <ArrowRight className="ml-2 size-5" /></>
                  )}
                </Button>
              </div>
            </Tabs>

            <AnimatePresence mode="wait">
              {selectedRole !== 'admin' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-10 text-center"
                >
                  <p className="text-muted-foreground font-medium">
                    New to CityServe?{' '}
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-primary hover:text-primary/80 font-black underline decoration-2 underline-offset-4"
                    >
                      Join now
                    </button>
                  </p>
                </motion.div>
              ) : (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-10 text-center"
                 >
                    <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                       <Shield className="size-4" /> Authorized Access Only
                    </p>
                 </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <motion.p 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="text-center mt-12 text-sm text-muted-foreground font-medium"
        >
          &copy; {new Date().getFullYear()} CityServe Platform. Built for excellence.
        </motion.p>
      </motion.div>
    </div>
  );
}
