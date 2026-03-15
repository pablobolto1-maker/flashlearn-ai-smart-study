import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const { text, count, difficulty, mode, question, answer, correctAnswer, studentAnswer } = await req.json();

    let prompt = '';
    let maxTokens = 4000;

    if (mode === 'explain') {
      maxTokens = 500;
      prompt = `Tu es un tuteur pédagogique bienveillant. L'étudiant n'a pas su répondre à cette question.
Question : "${question}"
Bonne réponse : "${answer}"

Commence OBLIGATOIREMENT par "Ce n'est pas cela," ou une formulation similaire indiquant que la réponse était incorrecte. Ne dis JAMAIS "excellente réponse" ou quoi que ce soit de positif sur la réponse de l'étudiant.
Donne une explication pédagogique en 2-3 phrases pour aider l'étudiant à comprendre et mémoriser la bonne réponse.`;
    } else if (mode === 'evaluate') {
      maxTokens = 300;
      prompt = `Tu es un correcteur. Compare la réponse de l'étudiant avec la bonne réponse.
Question : "${question}"
Bonne réponse : "${correctAnswer}"
Réponse de l'étudiant : "${studentAnswer}"

Réponds UNIQUEMENT avec un JSON valide : {"correct": true/false, "feedback": "1 phrase de feedback"}
Sois indulgent sur l'orthographe et les formulations proches.`;
    } else {
      // Generate cards
      let processedText = text;
      if (processedText.length > 100000) {
        const start = processedText.slice(0, 70000);
        const end = processedText.slice(-30000);
        processedText = start + '\n...\n' + end;
      }

      let adjustedCount = count;
      const minCharsPerCard = 80;
      const maxPossible = Math.max(3, Math.floor(processedText.length / minCharsPerCard));
      if (adjustedCount > maxPossible) adjustedCount = maxPossible;
      if (adjustedCount < 3) adjustedCount = 3;

      prompt = `Tu es un générateur de flashcards pédagogiques.
Réponds UNIQUEMENT avec un tableau JSON valide. Aucun texte avant ou après. Aucun markdown.
RÈGLE ABSOLUE : chaque carte DOIT être tirée EXCLUSIVEMENT du texte ci-dessous.
Génère exactement ${adjustedCount} cartes de niveau ${difficulty}.
FORMAT : [{"front":"...","back":"...","difficulty":"${difficulty}"}]
TEXTE SOURCE : ${processedText}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
