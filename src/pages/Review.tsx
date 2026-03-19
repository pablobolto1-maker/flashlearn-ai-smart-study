import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getExplanationStream } from '@/lib/ai';
import type { CardType, Difficulty } from '@/lib/types';

function getDifficultyFromHistory(history: boolean[], currentDiff: Difficulty): { diff: Difficulty; changed: boolean } {
  if (history.length < 5) return { diff: currentDiff, changed: false };
  const last5 = history.slice(-5);
  const ratio = last5.filter(Boolean).length / 5;
  const levels: Difficulty[] = ['easy', 'medium', 'hard'];
  const idx = levels.indexOf(currentDiff);
  if (ratio >= 0.8 && idx < 2) return { diff: levels[idx + 1], changed: true };
  if (ratio <= 0.4 && idx > 0) return { diff: levels[idx - 1], changed: true };
  return { diff: currentDiff, changed: false };
}

const diffLabels: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Facile', color: 'text-success', bg: 'bg-success/15' },
  medium: { label: 'Moyen', color: 'text-warning', bg: 'bg-warning/15' },
  hard: { label: 'Difficile', color: 'text-error', bg: 'bg-error/15' },
};

export default function Review() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards = [], mode, timer: hasTimer, difficulty: initDiff = 'easy' } = (location.state as any) || {};

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [history, setHistory] = useState<boolean[]>([]);
  const [currentDiff, setCurrentDiff] = useState<Difficulty>(initDiff as Difficulty);
  const [diffNotice, setDiffNotice] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const card: CardType | undefined = cards[index];

  // Timer
  useEffect(() => {
    if (!hasTimer || answered || flipped) return;
    setTimeLeft(30);
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); handleAnswer(false); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [index, hasTimer, answered, flipped]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !flipped && !answered) { e.preventDefault(); setFlipped(true); }
      if (e.code === 'ArrowRight' && flipped && !answered) handleAnswer(true);
      if (e.code === 'ArrowLeft' && flipped && !answered) handleAnswer(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipped, answered, index]);

  const handleAnswer = useCallback(async (correct: boolean) => {
    setAnswered(true);
    const newResults = [...results, correct];
    const newHistory = [...history, correct];
    setResults(newResults);
    setHistory(newHistory);

    // Adaptive difficulty
    const { diff, changed } = getDifficultyFromHistory(newHistory, currentDiff);
    if (changed) {
      setCurrentDiff(diff);
      setDiffNotice(`Niveau adapté : ${diffLabels[diff].label}`);
      setTimeout(() => setDiffNotice(''), 3000);
    }

    // Get explanation if wrong
    if (!correct && card) {
      setExplanation('');
      setIsStreaming(true);
      getExplanationStream(
        card.front,
        card.back,
        (text) => setExplanation(prev => prev + text),
        () => setIsStreaming(false)
      ).catch(() => setIsStreaming(false));
    }

    // Auto-advance after a delay
    setTimeout(() => {
      if (index + 1 >= cards.length) {
        navigate('/results', { state: { cards, results: newResults, difficulty: currentDiff } });
      } else {
        setIndex(i => i + 1);
        setFlipped(false);
        setAnswered(false);
        setExplanation('');
        setIsStreaming(false);
      }
    }, correct ? 800 : 2500);
  }, [results, history, currentDiff, index, cards, card, navigate]);

  if (!cards.length) { navigate('/'); return null; }
  if (!card) return null;

  const progress = ((index + 1) / cards.length) * 100;
  const dl = diffLabels[currentDiff] || diffLabels.easy;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{index + 1} / {cards.length}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${dl.bg} ${dl.color}`}>{dl.label}</span>
            {hasTimer && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${timeLeft <= 10 ? 'bg-error/15 text-error' : 'bg-muted text-muted-foreground'}`}>
                {timeLeft}s
              </span>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)' }} />
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex justify-center gap-4 mb-4">
        <span className="text-xs text-text-muted-dark">Espace = retourner</span>
        <span className="text-xs text-text-muted-dark">&larr; = manqué</span>
        <span className="text-xs text-text-muted-dark">&rarr; = réussi</span>
      </div>

      {diffNotice && (
        <div className="bg-accent-dim border border-accent-border rounded-input px-3 py-2 text-sm text-primary mb-4 animate-fadeIn text-center">
          {diffNotice}
        </div>
      )}

      {/* Flip Card */}
      <div className="perspective-1000 mb-6" style={{ perspective: '1000px' }} onClick={() => !flipped && !answered && setFlipped(true)}>
        <div
          className="relative w-full min-h-[280px] cursor-pointer transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
            transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Front */}
          <div className="absolute inset-0 bg-card border border-border rounded-card p-8 flex flex-col justify-center items-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Question</span>
            <p className="text-foreground text-lg text-center leading-relaxed">{card.front}</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 rounded-card p-8 flex flex-col justify-center items-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: '#0C3A6B' }}>
            <span className="text-xs uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>Réponse</span>
            <p className="text-foreground text-lg text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      {flipped && !answered && (
        <div className="flex gap-3 justify-center animate-pop">
          <button onClick={() => handleAnswer(false)} className="px-6 py-2.5 rounded-btn text-sm font-medium bg-error/15 text-error border border-error/25 btn-hover transition-colors">
            Je ne savais pas
          </button>
          <button onClick={() => handleAnswer(true)} className="px-6 py-2.5 rounded-btn text-sm font-medium bg-success/15 text-success border border-success/25 btn-hover transition-colors">
            Je savais
          </button>
        </div>
      )}

      {/* Explanation */}
      {(explanation || isStreaming) && (
        <div className="mt-4 bg-warning/10 border border-warning/25 rounded-card px-4 py-3 animate-fadeIn">
          <p className="text-sm text-foreground leading-relaxed">
            {explanation}
            {isStreaming && <span className="animate-pulse">▌</span>}
          </p>
        </div>
      )}
    </div>
  );
}
