import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSessions } from '@/hooks/useSessions';
import type { CardType } from '@/lib/types';

const scoreColor = (pct: number) => pct >= 80 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-error';
const scoreBarColor = (pct: number) => pct >= 80 ? '#1D9E75' : pct >= 50 ? '#BA7517' : '#A32D2D';
const scoreAdvice = (pct: number) => {
  if (pct >= 80) return { text: 'Excellent ! Vous maîtrisez bien ce sujet.', color: 'text-success', bg: 'bg-success/10 border-success/25' };
  if (pct >= 50) return { text: 'Pas mal ! Révisez les cartes manquées pour progresser.', color: 'text-warning', bg: 'bg-warning/10 border-warning/25' };
  return { text: 'Continuez à réviser, la répétition est la clé de la mémorisation.', color: 'text-error', bg: 'bg-error/10 border-error/25' };
};

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards = [], results = [], difficulty = 'easy' } = (location.state as any) || {};
  const { saveSession, fetchSessions, sessions } = useSessions();
  const [tab, setTab] = useState<'all' | 'wrong' | 'right'>('all');
  const [saved, setSaved] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const correct = results.filter(Boolean).length;
  const wrong = results.length - correct;
  const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  const advice = scoreAdvice(pct);

  useEffect(() => {
    if (!saved && results.length > 0) {
      saveSession({ pct, total: results.length, difficulty }).catch(() => {});
      setSaved(true);
      fetchSessions().catch(() => {});
    }
    setTimeout(() => setBarWidth(pct), 100);
  }, []);

  const filtered = cards.filter((_: CardType, i: number) => {
    if (tab === 'wrong') return !results[i];
    if (tab === 'right') return results[i];
    return true;
  });

  const wrongCards = cards.filter((_: CardType, i: number) => !results[i]);

  if (!results.length) { navigate('/'); return null; }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Score */}
      <div className="text-center mb-6 animate-fadeUp">
        <p className={`text-6xl font-bold ${scoreColor(pct)}`}>{pct}%</p>
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-4 max-w-xs mx-auto">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${barWidth}%`, backgroundColor: scoreBarColor(pct) }} />
        </div>
      </div>

      {/* Counters */}
      <div className="flex justify-center gap-6 mb-5 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{correct}</p>
          <p className="text-xs text-muted-foreground">Correctes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-error">{wrong}</p>
          <p className="text-xs text-muted-foreground">Manquées</p>
        </div>
      </div>

      {/* Advice */}
      <div className={`border rounded-card px-4 py-3 mb-6 animate-fadeUp ${advice.bg}`} style={{ animationDelay: '0.1s' }}>
        <p className={`text-sm ${advice.color}`}>{advice.text}</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-8 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
        {wrongCards.length > 0 && (
          <button onClick={() => navigate('/review', { state: { cards: wrongCards, mode: 'classic', timer: false, difficulty } })}
            className="px-4 py-2 rounded-btn text-sm bg-error/15 text-error border border-error/25 btn-hover transition-colors">
            Réviser les erreurs
          </button>
        )}
        <button onClick={() => navigate('/review', { state: { cards, mode: 'classic', timer: false, difficulty } })}
          className="px-4 py-2 rounded-btn text-sm bg-card border border-border text-muted-foreground btn-hover transition-colors">
          Recommencer
        </button>
        <Link to="/library" className="px-4 py-2 rounded-btn text-sm bg-card border border-border text-muted-foreground btn-hover transition-colors">
          Bibliothèque
        </Link>
        <Link to="/" className="px-4 py-2 rounded-btn text-sm bg-primary text-primary-foreground btn-hover transition-colors">
          Accueil
        </Link>
      </div>

      {/* Progress curve */}
      {sessions.length >= 2 && (
        <div className="bg-card border border-border rounded-card p-5 mb-6 animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-foreground text-sm font-semibold mb-3">Progression</h3>
          <ProgressCurve sessions={sessions} />
        </div>
      )}

      {/* Cards tabs */}
      <div className="flex gap-1 bg-muted rounded-btn p-1 mb-4 animate-fadeUp" style={{ animationDelay: '0.25s' }}>
        {[{ key: 'all', label: 'Toutes' }, { key: 'wrong', label: 'Ratées' }, { key: 'right', label: 'Réussies' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex-1 py-1.5 rounded-input text-xs font-medium transition-colors ${tab === t.key ? 'bg-card text-foreground' : 'text-muted-foreground'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((card: CardType, i: number) => {
          const origIdx = cards.indexOf(card);
          const isCorrect = results[origIdx];
          return (
            <div key={i} className={`bg-card border rounded-card px-4 py-3 ${isCorrect ? 'border-success/25' : 'border-error/25'}`}>
              <p className="text-sm text-foreground mb-1">{card.front}</p>
              <p className="text-xs text-muted-foreground">{card.back}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressCurve({ sessions }: { sessions: any[] }) {
  const w = 500, h = 120, pad = 20;
  const pts = sessions.map((s, i) => ({
    x: pad + (i / (sessions.length - 1)) * (w - 2 * pad),
    y: h - pad - (s.pct / 100) * (h - 2 * pad),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = line + ` L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map(v => {
        const y = h - pad - (v / 100) * (h - 2 * pad);
        return <line key={v} x1={pad} y1={y} x2={w - pad} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      <path d={area} fill="url(#curveGrad)" />
      <path d={line} fill="none" stroke="#22d3ee" strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill="#22d3ee" />)}
    </svg>
  );
}
