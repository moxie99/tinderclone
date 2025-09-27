import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageCacheOptions {
  maxCacheSize?: number;
  preloadImages?: boolean;
  lazyLoadThreshold?: number;
}

interface CachedImage {
  url: string;
  loaded: boolean;
  error: boolean;
  timestamp: number;
  size: number;
}

interface ImageCacheState {
  cache: Map<string, CachedImage>;
  loading: Set<string>;
  errors: Set<string>;
}

// Advanced image caching hook with memory management
export function useImageCache(options: ImageCacheOptions = {}) {
  const {
    maxCacheSize = 50, // Maximum number of images to cache
    preloadImages = true,
    lazyLoadThreshold = 200, // Pixels from viewport to start loading
  } = options;

  const [cacheState, setCacheState] = useState<ImageCacheState>({
    cache: new Map(),
    loading: new Set(),
    errors: new Set(),
  });

  const cacheRef = useRef<Map<string, CachedImage>>(new Map());
  const loadingRef = useRef<Set<string>>(new Set());
  const errorsRef = useRef<Set<string>>(new Set());

  // Memory management - LRU cache eviction
  const evictOldestImages = useCallback(() => {
    const cache = cacheRef.current;
    if (cache.size <= maxCacheSize) return;

    const entries = Array.from(cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, cache.size - maxCacheSize);
    toRemove.forEach(([url]) => {
      cache.delete(url);
    });
  }, [maxCacheSize]);

  // Preload image with error handling
  const preloadImage = useCallback(async (url: string): Promise<boolean> => {
    if (cacheRef.current.has(url) || loadingRef.current.has(url)) {
      return cacheRef.current.get(url)?.loaded || false;
    }

    loadingRef.current.add(url);
    setCacheState(prev => ({
      ...prev,
      loading: new Set([...prev.loading, url]),
    }));

    try {
      // Use Expo Image's preload method
      await Image.prefetch(url);
      
      const cachedImage: CachedImage = {
        url,
        loaded: true,
        error: false,
        timestamp: Date.now(),
        size: 0, // Size would be calculated in a real implementation
      };

      cacheRef.current.set(url, cachedImage);
      loadingRef.current.delete(url);
      errorsRef.current.delete(url);

      setCacheState(prev => ({
        cache: new Map(cacheRef.current),
        loading: new Set([...prev.loading].filter(u => u !== url)),
        errors: new Set([...prev.errors].filter(u => u !== url)),
      }));

      evictOldestImages();
      return true;
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
      
      const cachedImage: CachedImage = {
        url,
        loaded: false,
        error: true,
        timestamp: Date.now(),
        size: 0,
      };

      cacheRef.current.set(url, cachedImage);
      loadingRef.current.delete(url);
      errorsRef.current.add(url);

      setCacheState(prev => ({
        cache: new Map(cacheRef.current),
        loading: new Set([...prev.loading].filter(u => u !== url)),
        errors: new Set([...prev.errors, url]),
      }));

      return false;
    }
  }, [evictOldestImages]);

  // Batch preload multiple images
  const preloadImages = useCallback(async (urls: string[]): Promise<boolean[]> => {
    const results = await Promise.allSettled(
      urls.map(url => preloadImage(url))
    );
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : false
    );
  }, [preloadImage]);

  // Get image status
  const getImageStatus = useCallback((url: string) => {
    const cached = cacheRef.current.get(url);
    if (!cached) return 'not_loaded';
    if (cached.error) return 'error';
    if (cached.loaded) return 'loaded';
    return 'loading';
  }, []);

  // Check if image is cached and loaded
  const isImageLoaded = useCallback((url: string): boolean => {
    const cached = cacheRef.current.get(url);
    return cached?.loaded || false;
  }, []);

  // Check if image has error
  const hasImageError = useCallback((url: string): boolean => {
    const cached = cacheRef.current.get(url);
    return cached?.error || false;
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    loadingRef.current.clear();
    errorsRef.current.clear();
    
    setCacheState({
      cache: new Map(),
      loading: new Set(),
      errors: new Set(),
    });
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const loadedCount = Array.from(cache.values()).filter(img => img.loaded).length;
    const errorCount = Array.from(cache.values()).filter(img => img.error).length;
    const totalSize = Array.from(cache.values()).reduce((sum, img) => sum + img.size, 0);

    return {
      totalImages: cache.size,
      loadedImages: loadedCount,
      errorImages: errorCount,
      totalSize,
      loadingCount: loadingRef.current.size,
    };
  }, []);

  // Lazy loading hook for intersection observer
  const useLazyLoad = useCallback((url: string, threshold: number = lazyLoadThreshold) => {
    const [shouldLoad, setShouldLoad] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
      if (isInView && !shouldLoad) {
        setShouldLoad(true);
        preloadImage(url);
      }
    }, [isInView, shouldLoad, url, preloadImage]);

    return {
      shouldLoad,
      setIsInView,
      isLoaded: isImageLoaded(url),
      hasError: hasImageError(url),
    };
  }, [lazyLoadThreshold, preloadImage, isImageLoaded, hasImageError]);

  return {
    preloadImage,
    preloadImages,
    getImageStatus,
    isImageLoaded,
    hasImageError,
    clearCache,
    getCacheStats,
    useLazyLoad,
    cacheState,
  };
}

// Specialized hook for Tinder-like card images
export function useCardImageCache() {
  const imageCache = useImageCache({
    maxCacheSize: 20, // Keep more images for smooth swiping
    preloadImages: true,
    lazyLoadThreshold: 100,
  });

  // Preload next few cards' images
  const preloadCardImages = useCallback(async (users: any[]) => {
    const imageUrls = users
      .slice(0, 5) // Preload next 5 cards
      .flatMap(user => user.photos?.map((photo: any) => photo.url) || [])
      .filter(Boolean);

    if (imageUrls.length > 0) {
      await imageCache.preloadImages(imageUrls);
    }
  }, [imageCache]);

  return {
    ...imageCache,
    preloadCardImages,
  };
}
