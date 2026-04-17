import { useState, useCallback, useEffect } from 'react';

interface RecentService {
  _id: string;
  title: string;
  category: string;
  price: number;
  image: string;
  averageRating?: number;
  provider?: { name: string };
}

export function useRecentlyViewed() {
  const [recentViewed, setRecentViewed] = useState<RecentService[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recently-viewed');
    if (stored) {
      try {
        setRecentViewed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed', e);
      }
    }
  }, []);

  const addView = useCallback((service: RecentService) => {
    if (!service?._id) return;

    setRecentViewed((prev) => {
      // Remove any existing duplicate of this service
      const filtered = prev.filter((s) => s._id !== service._id);
      
      // Construct the minimal object for storage
      const minimalService: RecentService = {
        _id: service._id,
        title: service.title,
        category: service.category,
        price: service.price,
        image: service.image,
        averageRating: service.averageRating,
        provider: service.provider
      };

      const updated = [minimalService, ...filtered].slice(0, 5);
      localStorage.setItem('recently-viewed', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('recently-viewed');
    setRecentViewed([]);
  }, []);

  return { recentViewed, addView, clearHistory };
}
