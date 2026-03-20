import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { evaluateAnswer, getExplanationStream } from '@/lib/ai';
import type { CardType } from '@/lib/types';

export default function ExamReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards = [], timer: hasTimer, difficulty = 'easy' } = (location.state as any) || {};

  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [explanation, setExplanation] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAbortRef = useRef(false);

  const card: CardType | undefined = cards[index];

  useEffect(() => {
    if (!hasTimer || feedback) return;
    setTimeLeft(30);
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); handleSubmit(); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [index, hasTimer, feedback]);

  if (!cards.length) { navigate('/'); return null; }
  if (!card) return null;

  const handleSubmit = async () => {
    if (loading) return;
    streamAbortRef.current = false;
    setLoading(true);
    try {
      const result = await evaluateAnswer(card.front, card.back, answer);
      setFeedback(result);
      setResults([...results, result.correct]);
      if (!result.correct && card) {
        setExplanation('');
        setIsStreaming(true);
        getExplanationStream(
          card.front,
          card.back,
          (text) => { if (!streamAbortRef.current) setExplanation(prev => prev + text); },
          () => { if (!streamAbortRef.current) setIsStreaming(false); }
        ).catch(() => { if (!streamAbortRef.current) setIsStreaming(false); });
      }
    } catch {
      setFeedback({ correct: false, feedback: 'Erreur lors de l\'évaluation' });
      setResults([...results, false]);
    }
    setLoading(false);
  };

  const handleContinue = () => {
    streamAbortRef.current = true;
    if (index + 1 >= cards.length) {
      navigate('/results', { state: { cards, results: [...results], difficulty } });
    } else {
      setIndex(i => i + 1);
      setAnswer('');
      setFeedback(null);
      setExplanation('');
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !feedback) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{index + 1} / {cards.length}</span>
          {hasTimer && (
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${timeLeft <= 10 ? 'bg-error/15 text-error' : 'bg-muted text-muted-foreground'}`}>
              {timeLeft}s
            </span>
          )}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)' }} />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card border border-border rounded-card p-8 mb-4 animate-fadeUp">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Question</span>
        <p className="text-foreground text-lg mt-3 leading-relaxed">{card.front}</p>
      </div>

      {!feedback ? (
        <div className="animate-fadeIn">
          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Saisissez votre réponse... (Enter pour valider)"
            className="w-full h-28 bg-card border border-border rounded-input px-3 py-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary transition-colors mb-3"
          />
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-primary text-primary-foreground py-2.5 rounded-btn text-sm font-medium btn-hover transition-all disabled:opacity-50">
            {loading ? 'Évaluation...' : 'Valider'}
          </button>
        </div>
      ) : (
        <div className="animate-pop">
          <div className={`border rounded-card px-4 py-3 mb-3 ${feedback.correct ? 'bg-success/10 border-success/25' : 'bg-error/10 border-error/25'}`}>
            <p className={`font-semibold text-sm mb-1 ${feedback.correct ? 'text-success' : 'text-error'}`}>
              {feedback.correct ? 'Correct !' : 'Incorrect'}
            </p>
            <p className="text-sm text-foreground">{feedback.feedback}</p>
          </div>
          {!feedback.correct && (
            <div className="bg-card border border-border rounded-card px-4 py-3 mb-3">
              <span className="text-xs text-muted-foreground">Bonne réponse :</span>
              <p className="text-sm text-foreground mt-1">{card.back}</p>
            </div>
          )}
          {!feedback.correct && (explanation || isStreaming) && (
            <div className="bg-warning/10 border border-warning/25 rounded-card px-4 py-3 mb-3">
              <p className="text-sm text-foreground leading-relaxed">
                {explanation}
                {isStreaming && <span className="animate-pulse">▌</span>}
              </p>
            </div>
          )}
          <button onClick={handleContinue} className="w-full bg-primary text-primary-foreground py-2.5 rounded-btn text-sm font-medium btn-hover transition-all">
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
