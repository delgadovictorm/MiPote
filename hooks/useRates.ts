import { useState, useEffect } from "react";

export function useRates() {
  const [rates, setRates] = useState({ bcv: 0, usdt: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Aquí iría la lógica real para obtener tasas
        // Por ahora, placeholder
        setRates({ bcv: 36.5, usdt: 37.2 });
      } catch (error) {
        console.error('Error fetching rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading };
}