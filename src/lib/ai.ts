import { supabase } from '@/integrations/supabase/client';

export async function generateCards(text: string, count: number, difficulty: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non connecté');

  const response = await supabase.functions.invoke('generate-cards', {
    body: { text, count, difficulty },
  });

  if (response.error) throw new Error(response.error.message || 'Erreur lors de la génération');
  return response.data.content;
}

export async function getExplanation(question: string, answer: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non connecté');

  const response = await supabase.functions.invoke('generate-cards', {
    body: { mode: 'explain', question, answer },
  });

  if (response.error) throw new Error(response.error.message || 'Erreur');
  return response.data.content;
}

export async function evaluateAnswer(question: string, correctAnswer: string, studentAnswer: string): Promise<{ correct: boolean; feedback: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Non connecté');

  const response = await supabase.functions.invoke('generate-cards', {
    body: { mode: 'evaluate', question, correctAnswer, studentAnswer },
  });

  if (response.error) throw new Error(response.error.message || 'Erreur');
  try {
    return JSON.parse(response.data.content);
  } catch {
    return { correct: false, feedback: response.data.content };
  }
}
