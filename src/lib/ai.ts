import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

async function callGemini(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text ?? "";
}

export async function generateCards(text: string, count: number, difficulty: string): Promise<string> {
  if (text.length < 50) throw new Error('Le texte est trop court (minimum 50 caractères).');

  let processedText = text;
  if (processedText.length > 100000) {
    const start = processedText.slice(0, 70000);
    const end = processedText.slice(-30000);
    processedText = start + '\n...\n' + end;
  }

  const minCharsPerCard = 80;
  const maxPossible = Math.max(3, Math.floor(processedText.length / minCharsPerCard));
  let adjustedCount = Math.min(count, maxPossible);
  if (adjustedCount < 3) adjustedCount = 3;

  const instructions: Record<string, string> = {
    easy: 'questions simples, définitions directes',
    medium: 'compréhension, liens logiques entre concepts',
    hard: 'analyse, application, synthèse de plusieurs notions',
  };

  const prompt = `Tu es un générateur de flashcards pédagogiques.
Réponds UNIQUEMENT avec un tableau JSON valide.
Aucun texte avant ou après. Aucun markdown. Aucune explication.
RÈGLE ABSOLUE : chaque carte DOIT être tirée EXCLUSIVEMENT du texte ci-dessous.
Génère exactement ${adjustedCount} cartes de niveau ${difficulty} — ${instructions[difficulty] || instructions.easy}.
FORMAT : [{"front":"...","back":"...","difficulty":"${difficulty}"}]
TEXTE SOURCE :
---
${processedText}
---`;

  return await callGemini(prompt);
}

export async function getExplanation(question: string, answer: string): Promise<string> {
  const prompt = `Tu es un tuteur pédagogique bienveillant. L'étudiant n'a pas su répondre à cette question.
Question : "${question}"
Bonne réponse : "${answer}"

Commence OBLIGATOIREMENT par "Ce n'est pas cela," ou une formulation similaire indiquant que la réponse était incorrecte. Ne dis JAMAIS "excellente réponse" ou quoi que ce soit de positif sur la réponse de l'étudiant.
Donne une explication pédagogique en 2-3 phrases pour aider l'étudiant à comprendre et mémoriser la bonne réponse.`;

  return await callGemini(prompt);
}

export async function evaluateAnswer(question: string, correctAnswer: string, studentAnswer: string): Promise<{ correct: boolean; feedback: string }> {
  const prompt = `Tu es un correcteur. Compare la réponse de l'étudiant avec la bonne réponse.
Question : "${question}"
Bonne réponse : "${correctAnswer}"
Réponse de l'étudiant : "${studentAnswer}"

Réponds UNIQUEMENT avec un JSON valide : {"correct": true/false, "feedback": "1 phrase de feedback"}
Sois indulgent sur l'orthographe et les formulations proches.`;

  const raw = await callGemini(prompt);
  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { correct: false, feedback: raw };
  }
}
