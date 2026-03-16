import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateCards } from '@/lib/ai';
import { safeParseCards } from '@/lib/parseCards';
import { useCards } from '@/hooks/useCards';
import LoadingScreen from '@/components/LoadingScreen';

const CheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function Config() {
  const location = useLocation();
  const navigate = useNavigate();
  const { text = '', fileName = '' } = (location.state as any) || {};
  const { saveCards } = useCards();

  const [mode, setMode] = useState<'classic' | 'exam'>('classic');
  const [timer, setTimer] = useState(false);
  const [count, setCount] = useState(15);
  const [customCount, setCustomCount] = useState('');
  const [generating, setGenerating] = useState(false);
  const [percent, setPercent] = useState(0);
  const [error, setError] = useState('');

  if (!text) {
    navigate('/');
    return null;
  }

  const actualCount = customCount ? Math.min(200, Math.max(1, parseInt(customCount) || 15)) : count;

  const handleGenerate = async (difficulty: string) => {
    if (text.length < 50) {
      setError('Le texte est trop court (minimum 50 caractères).');
      return;
    }
    setError('');
    setGenerating(true);
    setPercent(5);

    const interval = setInterval(() => {
      setPercent(p => {
        if (p < 28) return p + 3;
        if (p < 65) return p + 2;
        if (p < 90) return p + 1;
        return p;
      });
    }, 400);

    try {
      const raw = await generateCards(text, actualCount, difficulty);
      setPercent(92);
      const cards = safeParseCards(raw);
      setPercent(96);
      const saved = await saveCards(cards.map(c => ({ ...c, difficulty })));
      clearInterval(interval);
      setPercent(100);
      setTimeout(() => {
        const path = mode === 'exam' ? '/exam' : '/review';
        navigate(path, { state: { cards: saved, mode, timer, difficulty } });
      }, 300);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Erreur lors de la génération');
      setGenerating(false);
    }
  };

  if (generating) {
    return <LoadingScreen message="Génération en cours..." percent={percent} />;
  }

  const diffOptions = [
    { key: 'easy', label: 'Facile', desc: 'Questions simples, définitions', color: 'text-success', bg: 'bg-success/15' },
    { key: 'medium', label: 'Moyen', desc: 'Compréhension, liens logiques', color: 'text-warning', bg: 'bg-warning/15' },
    { key: 'hard', label: 'Difficile', desc: 'Analyse, application, synthèse', color: 'text-error', bg: 'bg-error/15' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Success banner */}
      <div className="flex items-center gap-3 bg-success/10 border border-success/25 rounded-card px-4 py-3 mb-6 animate-fadeUp">
        <CheckCircle />
        <div>
          <p className="text-foreground text-sm font-medium">Document chargé</p>
          <p className="text-muted-foreground text-xs">{fileName} — {text.length.toLocaleString()} caractères</p>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-input px-3 py-2 text-sm mb-4">{error}</div>
      )}

      {/* Mode */}
      <section className="mb-6 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        <h3 className="text-foreground text-sm font-semibold mb-3">Mode de révision</h3>
        <div className="flex gap-3">
          {(['classic', 'exam'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-btn text-sm font-medium border transition-colors btn-hover ${
                mode === m ? 'bg-accent-dim border-accent-border text-primary' : 'bg-card border-border text-muted-foreground hover:border-border-hover'
              }`}
            >
              {m === 'classic' ? 'Classique' : 'Examen'}
            </button>
          ))}
        </div>
      </section>

      {/* Timer toggle */}
      <section className="mb-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between bg-card border border-border rounded-card px-4 py-3">
          <div>
            <p className="text-foreground text-sm font-medium">Minuteur</p>
            <p className="text-muted-foreground text-xs">30 secondes par carte</p>
          </div>
          <button onClick={() => setTimer(!timer)} className={`w-11 h-6 rounded-full relative transition-colors ${timer ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-foreground transition-transform ${timer ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>
      </section>

      {/* Card count */}
      <section className="mb-6 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
        <h3 className="text-foreground text-sm font-semibold mb-3">Nombre de cartes</h3>
        <div className="flex gap-2 flex-wrap">
          {[15, 30, 80].map(n => (
            <button key={n} onClick={() => { setCount(n); setCustomCount(''); }}
              className={`px-4 py-2 rounded-btn text-sm font-medium border transition-colors btn-hover ${
                count === n && !customCount ? 'bg-accent-dim border-accent-border text-primary' : 'bg-card border-border text-muted-foreground hover:border-border-hover'
              }`}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            min={1}
            max={200}
            value={customCount}
            onChange={e => setCustomCount(e.target.value)}
            placeholder="Personnalisé"
            className="w-28 bg-card border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </section>

      {/* Difficulty */}
      <section className="animate-fadeUp" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-foreground text-sm font-semibold mb-3">Difficulté</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {diffOptions.map(d => (
            <button key={d.key} onClick={() => handleGenerate(d.key)}
              className="bg-card border border-border rounded-card p-4 text-left hover:border-border-hover btn-hover transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${d.color}`}>{d.label}</span>
                <span className={`text-xs ${d.bg} ${d.color} px-2 py-0.5 rounded-full`}>{actualCount}</span>
              </div>
              <p className="text-muted-foreground text-xs">{d.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
