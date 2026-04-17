import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Bell, ShieldCheck, Moon, Laptop, Sun, Save, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      bookingRequests: true,
      systemAlerts: true,
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
    },
    appearance: 'light',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-heading font-black tracking-tight mb-2">System Control</h1>
        <p className="text-muted-foreground font-medium">Global platform configuration and security preferences</p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Notification Settings */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-[2rem] border-none bg-secondary/30 shadow-none">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <Bell className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-heading font-black">Notifications</CardTitle>
              </div>
              <CardDescription className="font-medium text-muted-foreground">Manage how the platform communicates with you</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-transparent hover:border-blue-500/20 transition-all">
                <div>
                  <Label className="text-base font-bold">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly reports and system alerts</p>
                </div>
                <Switch 
                  checked={settings.notifications.email} 
                  onCheckedChange={(checked: boolean) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-transparent hover:border-blue-500/20 transition-all">
                <div>
                  <Label className="text-base font-bold">Booking Requests</Label>
                  <p className="text-sm text-muted-foreground">Real-time alerts for new service queries</p>
                </div>
                <Switch 
                    checked={settings.notifications.bookingRequests} 
                    onCheckedChange={(checked: boolean) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, bookingRequests: checked }
                    })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-[2rem] border-none bg-secondary/30 shadow-none">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-heading font-black">Security</CardTitle>
              </div>
              <CardDescription className="font-medium text-muted-foreground">Protect administrative access and data</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-transparent hover:border-emerald-500/20 transition-all">
                <div>
                  <Label className="text-base font-bold">2FA Authentication</Label>
                  <p className="text-sm text-muted-foreground">Mandatory for all admin level accounts</p>
                </div>
                <Switch 
                    checked={settings.security.twoFactor} 
                    onCheckedChange={(checked: boolean) => setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactor: checked }
                    })}
                />
              </div>
              <div className="pt-4 flex justify-start">
                <Button variant="outline" className="rounded-xl font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5">
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Master Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Banner */}
        <motion.div variants={itemVariants}>
          <Card className="bg-primary text-primary-foreground rounded-[2rem] border-none shadow-premium overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 size-40 bg-white/10 rounded-full blur-3xl" />
            <CardContent className="p-10 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-heading font-black mb-2">Need Platform Help? 🛠️</h3>
                  <p className="text-primary-foreground/80 font-medium max-w-md">Our technical team is available 24/7 for administrative support and system updates.</p>
                </div>
                <Button className="bg-white text-black hover:bg-gray-100 font-black rounded-xl h-14 px-10 shadow-xl">
                  Message Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Actions */}
        <motion.div variants={itemVariants} className="flex justify-end pt-6">
          <Button 
            className="px-12 h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-3" />
            ) : (
              <Save className="h-5 w-5 mr-3" />
            )}
            Push Global Changes
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
