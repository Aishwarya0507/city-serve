import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Heart, Star, Clock, Trash2, Loader2, ArrowRight, Bookmark, Sparkles } from 'lucide-react';
import API from '../../lib/api';
import { toast } from 'sonner';
import { EmptyState } from '../ui/EmptyState';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data } = await API.get('/favorites');
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (favoriteId: string) => {
    try {
      await API.delete(`/favorites/${favoriteId}`);
      setFavorites(favorites.filter(f => f._id !== favoriteId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-2"
      >
        <div className="flex items-center gap-4 mb-2">
           <div className="size-14 rounded-[1.5rem] bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
              <Heart className="size-7 fill-rose-500" />
           </div>
           <div>
              <h1 className="text-4xl font-heading font-black tracking-tight">Saved Services</h1>
              <p className="text-muted-foreground font-medium mt-1">Your curated list of preferred professionals</p>
           </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          emoji="❤️"
          title="No favorites yet"
          description="Save the services you love to quickly access them later when you need them."
          actionLabel="Explore Services"
          onAction={() => navigate('/customer/services')}
        />
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {favorites.map((favorite) => {
            const service = favorite.service;
            if (!service) return null;
            
            return (
              <motion.div key={favorite._id} variants={itemVariants}>
                <Card className="group relative overflow-hidden border bg-card/50 backdrop-blur-sm hover:bg-white dark:hover:bg-black/40 shadow-none hover:shadow-premium transition-all duration-500 rounded-[2.5rem] h-full flex flex-col">
                  {/* Service Header / Visualization */}
                  <div className="relative h-44 bg-gradient-to-br from-primary/5 to-primary/20 p-8 flex items-end overflow-hidden">
                    <div className="absolute top-6 right-6 z-10">
                      <Button
                        variant="secondary"
                        className="size-12 rounded-2xl p-0 shadow-lg border-none hover:bg-rose-500 hover:text-white transition-all transform hover:rotate-12"
                        onClick={() => handleRemove(favorite._id)}
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] pointer-events-none" />
                    
                    <div className="z-10 w-full flex items-center justify-between">
                       <Badge className="bg-white/90 dark:bg-black/90 backdrop-blur text-primary font-black px-4 py-2 rounded-xl border border-primary/20 shadow-lg text-lg">
                          ₹{service.price}
                       </Badge>
                       <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-black/90 rounded-xl backdrop-blur border shadow-sm">
                          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-black">{service.averageRating > 0 ? service.averageRating.toFixed(1) : 'New'}</span>
                       </div>
                    </div>
                  </div>

                  <CardContent className="p-8 flex-1 flex flex-col pt-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary tracking-widest mb-2">
                       <Sparkles className="size-3" /> Recommended
                    </div>
                    <h3 className="text-2xl font-heading font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
                    
                    <p className="text-muted-foreground text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                       This high-quality service by <span className="font-bold text-foreground">{service.provider?.name || 'Top Pro'}</span> is ready to be delivered at your doorstep.
                    </p>

                    <div className="mt-auto pt-6 border-t flex items-center justify-between gap-4">
                       <Button
                         className="flex-1 rounded-2xl h-14 bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                         onClick={() => navigate(`/customer/book/${service._id}`)}
                       >
                         Book Now <ArrowRight className="ml-2 size-5" />
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
