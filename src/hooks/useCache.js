// src/hooks/useCache.js
import { useState, useEffect } from "react";

/**
 * Hook custom pour gérer un cache de session avec un Time-To-Live (TTL).
 * @param {string} key - La clé unique pour l'entrée du cache.
 * @param {() => Promise<T>} fetcher - La fonction asynchrone qui récupère les données.
 * @param {number} ttl - Le temps de validité du cache en millisecondes.
 * @returns {{ data: T | null, loading: boolean, error: string | null }}
 */
export function useCache(key, fetcher, ttl = 60000) {
  // TTL par défaut : 1 minute
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndCache = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher();
        setData(result);
        const cacheEntry = {
          data: result,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(key, JSON.stringify(cacheEntry));
      } catch (err) {
        setError(err.message);
        console.error(`[Cache] Failed to fetch data for key "${key}":`, err);
      } finally {
        setLoading(false);
      }
    };

    const cachedEntry = sessionStorage.getItem(key);

    if (cachedEntry) {
      const { data: cachedData, timestamp } = JSON.parse(cachedEntry);
      if (Date.now() - timestamp < ttl) {
        // Le cache est valide, on l'utilise
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    // Sinon, on fetch de nouvelles données
    fetchAndCache();
  }, [key, fetcher, ttl]); // On s'assure que le hook réagit aux changements de clé ou de fetcher

  return { data, loading, error };
}
