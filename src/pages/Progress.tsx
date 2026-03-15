import { useEffect } from 'react';
import { useSessions } from '@/hooks/useSessions';

const diffLabels: Record<string, string> = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' };

export default function Progress() {
  const { sessions, loading, fetchSessions } = useSessions();

  useEffect(() => { fetchSessions(); }, []);

  const avg = sessions.length ? Math.round(sessions.reduce((a, s) => a + s.pct, 0) / sessions.length) : 0;
  const best = sessions.length ? Math.max(...sessions.map(s => s.pct)) : 0;

  const scoreColor = (p: number) => p >= 80 ? 'text-success' : p >= 50 ? 'text-warning' : 'text-error';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-foreground mb-6 animate-fadeUp">Progression</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        {[
          { label: 'Sessions', value: sessions.length },
          { label: 'Moyenne', value: `${avg}%` },
          { label: 'Meilleur', value: `${best}%` },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {sessions.length >= 2 && (
        <div className="bg-card border border-border rounded-card p-5 mb-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-foreground text-sm font-semibold mb-3">Courbe de progression</h3>
          <ProgressChart sessions={sessions} />
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-2 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
        {loading && <p className="text-muted-foreground text-sm">Chargement...</p>}
        {sessions.slice().reverse().map((s, i) => (
          <div key={s.id} className="bg-card border border-border rounded-card px-4 py-3 flex items-center gap-4">
            <span className="text-xs text-text-muted-dark w-6">#{sessions.length - i}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">{s.total} cartes</span>
                {s.difficulty && <span className="text-xs text-muted-foreground">{diffLabels[s.difficulty] || s.difficulty}</span>}
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 80 ? '#1D9E75' : s.pct >= 50 ? '#BA7517' : '#A32D2D' }} />
              </div>
            </div>
            <span className={`text-sm font-bold ${scoreColor(s.pct)}`}>{s.pct}%</span>
          </div>
        ))}
        {!loading && sessions.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Aucune session enregistrée</p>
        )}
      </div>
    </div>
  );
}

function ProgressChart({ sessions }: { sessions: any[] }) {
  const w = 520, h = 140, pad = 30;
  const pts = sessions.map((s, i) => ({
    x: pad + (i / (sessions.length - 1)) * (w - 2 * pad),
    y: h - pad - (s.pct / 100) * (h - 2 * pad),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = line + ` L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map(v => {
        const y = h - pad - (v / 100) * (h - 2 * pad);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" />
            <text x={pad - 4} y={y + 3} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}%</text>
          </g>
        );
      })}
      <path d={area} fill="url(#pgGrad)" />
      <path d={line} fill="none" stroke="#22d3ee" strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#22d3ee" />)}
    </svg>
  );
}
