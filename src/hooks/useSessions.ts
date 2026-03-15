import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SessionType } from '@/lib/types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    setSessions((data as SessionType[]) || []);
    setLoading(false);
    return (data as SessionType[]) || [];
  }, []);

  const saveSession = useCallback(async (session: Omit<SessionType, 'id' | 'user_id' | 'created_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non connecté');
    const { error } = await supabase.from('sessions').insert({
      user_id: user.id,
      ...session,
    });
    if (error) throw error;
  }, []);

  return { sessions, loading, fetchSessions, saveSession };
}
