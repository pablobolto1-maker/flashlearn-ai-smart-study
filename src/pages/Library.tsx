import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCards } from '@/hooks/useCards';
import ConfirmModal from '@/components/ConfirmModal';
import type { CardType } from '@/lib/types';

const diffBadge: Record<string, { label: string; color: string; bg: string }> = {
  easy: { label: 'Facile', color: 'text-success', bg: 'bg-success/15' },
  medium: { label: 'Moyen', color: 'text-warning', bg: 'bg-warning/15' },
  hard: { label: 'Difficile', color: 'text-error', bg: 'bg-error/15' },
};

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export default function Library() {
  const { cards, loading, fetchCards, deleteCard } = useCards();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [newDeck, setNewDeck] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchCards(); }, []);

  const decks = ['all', ...Array.from(new Set(cards.map(c => c.deck)))];
  const filtered = filter === 'all' ? cards : cards.filter(c => c.deck === filter);

  const exportCSV = () => {
    const rows = [['Recto', 'Verso', 'Difficulté', 'Deck', 'Score']];
    cards.forEach(c => rows.push([c.front, c.back, c.difficulty, c.deck, String(c.score)]));
    const csv = rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'flashcards.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>FlashLearn AI - Export</title><style>
      body{font-family:'Segoe UI',sans-serif;padding:40px;color:#222}
      .card{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:12px;page-break-inside:avoid}
      .q{font-weight:600;margin-bottom:4px}.a{color:#555}
      .badge{display:inline-block;font-size:11px;padding:2px 8px;border-radius:12px;background:#f0f0f0}
    </style></head><body><h1>FlashLearn AI - Mes Flashcards</h1>`);
    cards.forEach(c => {
      w.document.write(`<div class="card"><div class="q">${c.front}</div><div class="a">${c.back}</div><span class="badge">${c.difficulty}</span></div>`);
    });
    w.document.write('</body></html>');
    w.document.close();
    w.print();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCard(deleteId);
      await fetchCards();
      setDeleteId(null);
    }
  };

  const handleNewDeck = () => {
    if (newDeck.trim()) {
      setFilter(newDeck.trim());
      setNewDeck('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6 animate-fadeUp">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bibliothèque</h1>
          <p className="text-sm text-muted-foreground">{cards.length} cartes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs bg-card border border-border text-muted-foreground btn-hover transition-colors">
            <DownloadIcon /> CSV
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs bg-card border border-border text-muted-foreground btn-hover transition-colors">
            <DownloadIcon /> PDF
          </button>
          <button onClick={() => navigate('/edit')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs bg-primary text-primary-foreground btn-hover transition-colors">
            <PlusIcon /> Carte
          </button>
          {cards.length > 0 && (
            <button onClick={() => navigate('/review', { state: { cards, mode: 'classic', timer: false, difficulty: 'easy' } })}
              className="px-3 py-1.5 rounded-btn text-xs bg-accent-dim text-primary border border-accent-border btn-hover transition-colors">
              Réviser
            </button>
          )}
        </div>
      </div>

      {/* Deck filters */}
      <div className="flex gap-2 flex-wrap mb-4 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        {decks.map(d => (
          <button key={d} onClick={() => setFilter(d)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === d ? 'bg-accent-dim text-primary border border-accent-border' : 'bg-card border border-border text-muted-foreground'
            }`}>
            {d === 'all' ? 'Tous' : d}
          </button>
        ))}
        <div className="flex items-center gap-1">
          <input value={newDeck} onChange={e => setNewDeck(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNewDeck()}
            placeholder="Nouveau deck" className="w-28 bg-card border border-border rounded-input px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary" />
          <button onClick={handleNewDeck} className="w-6 h-6 flex items-center justify-center rounded-input bg-card border border-border text-muted-foreground hover:text-foreground">
            <PlusIcon />
          </button>
        </div>
      </div>

      {loading && <p className="text-muted-foreground text-sm">Chargement...</p>}

      {/* Cards list */}
      <div className="space-y-2 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        {filtered.map(card => {
          const db = diffBadge[card.difficulty] || diffBadge.easy;
          return (
            <div key={card.id} className="bg-card border border-border rounded-card px-4 py-3 flex items-center gap-3 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{card.front}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${db.bg} ${db.color}`}>{db.label}</span>
                  <span className="text-xs text-muted-foreground">Score: {card.score}</span>
                  <span className="text-xs text-text-muted-dark">{card.deck}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => navigate('/edit', { state: { card } })} className="p-1.5 rounded-input text-muted-foreground hover:text-foreground transition-colors">
                  <EditIcon />
                </button>
                <button onClick={() => setDeleteId(card.id!)} className="p-1.5 rounded-input text-muted-foreground hover:text-error transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Aucune carte trouvée</p>
        )}
      </div>

      <ConfirmModal
        open={!!deleteId}
        title="Supprimer la carte"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer cette carte ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
