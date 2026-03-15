import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCards } from '@/hooks/useCards';
import type { CardType } from '@/lib/types';

export default function EditCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveCards, updateCard } = useCards();
  const existing: CardType | undefined = (location.state as any)?.card;

  const [front, setFront] = useState(existing?.front || '');
  const [back, setBack] = useState(existing?.back || '');
  const [deck, setDeck] = useState(existing?.deck || 'Général');
  const [difficulty, setDifficulty] = useState(existing?.difficulty || 'easy');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!front.trim() || !back.trim()) {
      setError('Remplissez le recto et le verso');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (existing?.id) {
        await updateCard(existing.id, { front, back, deck, difficulty });
      } else {
        await saveCards([{ front, back, deck, difficulty, score: 0 }]);
      }
      navigate('/library');
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  const diffs = [
    { key: 'easy', label: 'Facile', color: 'text-success', bg: 'bg-success/15', border: 'border-success/25' },
    { key: 'medium', label: 'Moyen', color: 'text-warning', bg: 'bg-warning/15', border: 'border-warning/25' },
    { key: 'hard', label: 'Difficile', color: 'text-error', bg: 'bg-error/15', border: 'border-error/25' },
  ];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-foreground mb-6 animate-fadeUp">
        {existing ? 'Modifier la carte' : 'Nouvelle carte'}
      </h1>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-input px-3 py-2 text-sm mb-4">{error}</div>
      )}

      <div className="space-y-4 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Recto (Question)</label>
          <textarea value={front} onChange={e => setFront(e.target.value)}
            className="w-full h-24 bg-card border border-border rounded-input px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Verso (Réponse)</label>
          <textarea value={back} onChange={e => setBack(e.target.value)}
            className="w-full h-24 bg-card border border-border rounded-input px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">Deck</label>
          <input value={deck} onChange={e => setDeck(e.target.value)}
            className="w-full bg-card border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-2">Difficulté</label>
          <div className="flex gap-2">
            {diffs.map(d => (
              <button key={d.key} onClick={() => setDifficulty(d.key)}
                className={`flex-1 py-2 rounded-btn text-sm font-medium border transition-colors btn-hover ${
                  difficulty === d.key ? `${d.bg} ${d.border} ${d.color}` : 'bg-card border-border text-muted-foreground'
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <button onClick={() => navigate('/library')} className="flex-1 py-2.5 rounded-btn text-sm border border-border text-muted-foreground btn-hover transition-colors">
          Annuler
        </button>
        <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-btn text-sm bg-primary text-primary-foreground font-medium btn-hover transition-all disabled:opacity-50">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
