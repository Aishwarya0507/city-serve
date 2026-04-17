import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, Calendar, ShieldCheck, Mail, Loader2, Link as LinkIcon, Star } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import API from '../../lib/api';
import { useNavigate } from 'react-router';

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking_accepted': return <Calendar className="size-4 text-emerald-500" />;
      case 'booking_completed': return <Star className="size-4 text-primary" />;
      case 'service_approved': return <ShieldCheck className="size-4 text-blue-500" />;
      default: return <Mail className="size-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative rounded-xl hover:bg-secondary/80 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="size-5 dark:text-gray-300" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg border-2 border-background ring-2 ring-primary/20 animate-pulse"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 10, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-[100] w-80 md:w-96 rounded-[2rem] border bg-white/95 dark:bg-black/90 backdrop-blur-2xl shadow-premium overflow-hidden"
          >
            <div className="p-6 border-b flex items-center justify-between bg-secondary/30">
              <div>
                <h3 className="font-heading font-black text-xl tracking-tight">Updates</h3>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">Notification Inbox</p>
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] uppercase font-black tracking-widest text-primary hover:bg-primary/5 rounded-lg h-8"
                  onClick={markAllAsRead}
                >
                  <Check className="size-3 mr-1" /> Clear All
                </Button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto no-scrollbar py-2">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <Loader2 className="size-6 animate-spin text-primary opacity-30" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4 text-2xl">📪</div>
                  <p className="font-bold text-sm">Quiet as a mouse</p>
                  <p className="text-xs text-muted-foreground mt-1">You're all caught up for now!</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {notifications.map((n, i) => (
                    <motion.div 
                      key={n._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 hover:bg-secondary/40 transition-all cursor-pointer relative group ${!n.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(n._id, n.link)}
                    >
                      {!n.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                      <div className="flex gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${!n.isRead ? 'bg-white dark:bg-black/40 text-primary' : 'bg-secondary text-muted-foreground opacity-60'}`}>
                          {getTypeIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-bold' : 'text-muted-foreground font-medium'}`}>
                            {n.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                             <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60 transition-colors group-hover:text-primary">
                               {new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                             </span>
                             {n.link && (
                               <LinkIcon className="size-3 text-primary opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2" />
                             )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-secondary/10">
              <Button 
                variant="ghost" 
                className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                onClick={() => {
                   setIsOpen(false);
                   // Full inbox route could be added here if needed
                }}
              >
                Close Panel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
