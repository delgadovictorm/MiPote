import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useTransacciones(espacioId?: string) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!espacioId) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transacciones_saas')
        .select('*')
        .eq('espacio_id', espacioId)
        .order('created_at', { ascending: false });

      if (!error) {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [espacioId]);

  const addTransaction = async (transaction: any) => {
    const { data, error } = await supabase
      .from('transacciones_saas')
      .insert([transaction])
      .select();

    if (!error && data) {
      setTransactions(prev => [data[0], ...prev]);
    }
  };

  return { transactions, loading, addTransaction };
}