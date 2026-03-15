import { CardType } from './types';

export function safeParseCards(raw: string): CardType[] {
  // 1. Direct JSON.parse
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].front) {
      return parsed.map(normalizeCard);
    }
  } catch {}

  // 2. Extract array [...] and repair if truncated
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      let arrStr = match[0];
      // Try to repair truncated JSON
      const openBraces = (arrStr.match(/{/g) || []).length;
      const closeBraces = (arrStr.match(/}/g) || []).length;
      if (openBraces > closeBraces) {
        arrStr = arrStr + '"}' + ']';
      }
      const parsed = JSON.parse(arrStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((c: any) => c.front && c.back).map(normalizeCard);
      }
    }
  } catch {}

  // 3. Extract individual objects with regex
  try {
    const objRegex = /\{[^{}]*"front"\s*:\s*"([^"]*)"[^{}]*"back"\s*:\s*"([^"]*)"[^{}]*(?:"difficulty"\s*:\s*"([^"]*)")?[^{}]*\}/g;
    const objRegex2 = /\{[^{}]*"back"\s*:\s*"([^"]*)"[^{}]*"front"\s*:\s*"([^"]*)"[^{}]*(?:"difficulty"\s*:\s*"([^"]*)")?[^{}]*\}/g;
    
    let cards: CardType[] = [];
    let m;
    while ((m = objRegex.exec(raw)) !== null) {
      cards.push(normalizeCard({ front: m[1], back: m[2], difficulty: m[3] || 'easy' }));
    }
    if (cards.length === 0) {
      while ((m = objRegex2.exec(raw)) !== null) {
        cards.push(normalizeCard({ front: m[2], back: m[1], difficulty: m[3] || 'easy' }));
      }
    }
    if (cards.length > 0) return cards;
  } catch {}

  // 4. Key-by-key extraction
  try {
    const fronts = [...raw.matchAll(/"front"\s*:\s*"([^"]*)"/g)].map(m => m[1]);
    const backs = [...raw.matchAll(/"back"\s*:\s*"([^"]*)"/g)].map(m => m[1]);
    const diffs = [...raw.matchAll(/"difficulty"\s*:\s*"([^"]*)"/g)].map(m => m[1]);
    if (fronts.length > 0 && backs.length > 0) {
      const len = Math.min(fronts.length, backs.length);
      return Array.from({ length: len }, (_, i) =>
        normalizeCard({ front: fronts[i], back: backs[i], difficulty: diffs[i] || 'easy' })
      );
    }
  } catch {}

  // 5. Final error
  throw new Error(`Impossible de parser la réponse IA. Aperçu : ${raw.slice(0, 300)}`);
}

function normalizeCard(c: any): CardType {
  return {
    front: c.front || '',
    back: c.back || '',
    difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'easy',
    deck: c.deck || 'Général',
    score: c.score || 0,
  };
}
