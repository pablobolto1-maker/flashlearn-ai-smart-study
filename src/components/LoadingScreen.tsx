interface Props {
  message: string;
  percent: number;
}

const steps = [
  { label: 'Lecture du document', range: [0, 30] },
  { label: 'Analyse du contenu', range: [30, 70] },
  { label: 'Génération des cartes', range: [70, 100] },
];

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SmallSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

export default function LoadingScreen({ message, percent }: Props) {
  const displayPercent = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', backgroundColor: 'var(--background, #0a0a0a)' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>

        {/* Spinner */}
        <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 24px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--border)' }} />
          <div className="animate-spin-slow" style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--primary)' }} />
          <div className="animate-spin-reverse" style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '2px solid transparent', borderBottomColor: 'var(--primary)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
          </div>
        </div>

        <p style={{ color: 'var(--foreground)', fontWeight: 500, marginBottom: '4px' }}>{message}</p>
        <p style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>{displayPercent}%</p>

        {/* Steps */}
        <div style={{ marginBottom: '24px', textAlign: 'left' }}>
          {steps.map((step, i) => {
            const done = displayPercent > step.range[1];
            const active = displayPercent >= step.range[0] && displayPercent <= step.range[1];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(34,197,94,0.2)' : active ? 'var(--accent)' : 'var(--muted)',
                  color: done ? '#22c55e' : active ? 'var(--primary)' : 'var(--muted-foreground)',
                }}>
                  {done ? <CheckIcon /> : active ? <SmallSpinner /> : <span style={{ fontSize: '11px' }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: '14px', color: done ? 'var(--foreground)' : active ? 'var(--primary)' : 'var(--muted-foreground)', flex: 1 }}>
                  {step.label}
                </span>
                {done && <span style={{ fontSize: '11px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', padding: '2px 8px', borderRadius: '999px' }}>Terminé</span>}
                {active && <span style={{ fontSize: '11px', background: 'var(--accent)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '999px' }}>En cours</span>}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: '6px', background: 'var(--muted)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            borderRadius: '999px',
            width: `${displayPercent}%`,
            background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>
    </div>
  );
}