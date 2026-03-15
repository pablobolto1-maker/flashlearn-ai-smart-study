import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CardType } from '@/lib/types';

export function useCards() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setCards((data as CardType[]) || []);
    setLoading(false);
    return (data as CardType[]) || [];
  }, []);

  const saveCards = useCallback(async (newCards: CardType[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non connecté');
    const rows = newCards.map(c => ({
      user_id: user.id,
      front: c.front,
      back: c.back,
      difficulty: c.difficulty,
      deck: c.deck,
      score: c.score || 0,
    }));
    const { data, error } = await supabase.from('cards').insert(rows).select();
    if (error) throw error;
    return (data as CardType[]) || [];
  }, []);

  const updateCard = useCallback(async (id: string, updates: Partial<CardType>) => {
    const { error } = await supabase.from('cards').update(updates).eq('id', id);
    if (error) throw error;
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    const { error } = await supabase.from('cards').delete().eq('id', id);
    if (error) throw error;
  }, []);

  return { cards, loading, fetchCards, saveCards, updateCard, deleteCard };
}
