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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-[420px] text-center">

        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
          <div className="animate-spin-reverse absolute inset-2 rounded-full border-2 border-transparent border-b-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse-dot w-2.5 h-2.5 rounded-full bg-primary" />
          </div>
        </div>

        <p className="text-foreground font-medium mb-1">{message}</p>
        <p className="text-primary text-3xl font-bold mb-6">{displayPercent}%</p>

        {/* Steps */}
        <div className="mb-6 text-left">
          {steps.map((step, i) => {
            const done = displayPercent > step.range[1];
            const active = displayPercent >= step.range[0] && displayPercent <= step.range[1];
            return (
              <div key={i} className="flex items-center gap-3 mb-2.5">
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  done ? 'bg-green-500/20 text-green-500' : active ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {done ? <CheckIcon /> : active ? <SmallSpinner /> : <span className="text-[11px]">{i + 1}</span>}
                </div>
                <span className={`text-sm flex-1 ${
                  done ? 'text-foreground' : active ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {done && <span className="text-[11px] bg-green-500/15 text-green-500 px-2 py-0.5 rounded-full">Terminé</span>}
                {active && <span className="text-[11px] bg-accent text-primary px-2 py-0.5 rounded-full">En cours</span>}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-800 ease-out"
            style={{
              width: `${displayPercent}%`,
              background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)',
            }} 
          />
        </div>
      </div>
    </div>
  );
}