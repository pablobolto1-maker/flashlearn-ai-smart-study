import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractFile } from '@/lib/fileExtract';

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
  </svg>
);

const AdjustIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const features = [
  { icon: <SparkleIcon />, title: 'Génération IA', desc: 'Claude analyse votre contenu et crée des flashcards pertinentes' },
  { icon: <AdjustIcon />, title: 'Difficulté adaptive', desc: "Le niveau s'adapte automatiquement à vos performances" },
  { icon: <ClipboardIcon />, title: 'Mode examen', desc: 'Testez vos connaissances avec des réponses écrites' },
];

const formats = ['PDF', 'Excel', 'Word', 'TXT'];

export default function Home() {
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = async (file: File) => {
    setError('');
    setLoading(true);
    try {
      const content = await extractFile(file);
      setFileName(file.name);
      navigate('/config', { state: { text: content, fileName: file.name } });
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleGenerate = () => {
    if (text.length < 30) return;
    navigate('/config', { state: { text, fileName: 'Texte collé' } });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Badge */}
      <div className="flex justify-center mb-6 animate-fadeUp">
        <div className="flex items-center gap-2 bg-accent-dim border border-accent-border rounded-full px-4 py-1.5 text-xs text-primary font-medium">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
          PROPULSÉ PAR L'INTELLIGENCE ARTIFICIELLE
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 animate-fadeUp" style={{ animationDelay: '0.05s' }}>
        Transformez vos cours
        <br />
        <span className="text-primary">en flashcards intelligentes</span>
      </h1>
      <p className="text-center text-muted-foreground mb-10 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        Importez vos documents ou collez votre texte, l'IA fait le reste
      </p>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-card p-6 animate-fadeUp" style={{ animationDelay: '0.15s' }}>
        {/* Tabs */}
        <div className="flex bg-muted rounded-btn p-1 mb-5">
          <button
            onClick={() => setTab('file')}
            className={`flex-1 py-2 rounded-input text-sm font-medium transition-colors ${tab === 'file' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Importer un fichier
          </button>
          <button
            onClick={() => setTab('text')}
            className={`flex-1 py-2 rounded-input text-sm font-medium transition-colors ${tab === 'text' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Coller du texte
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-input px-3 py-2 text-sm mb-4">{error}</div>
        )}

        {tab === 'file' ? (
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-card py-12 flex flex-col items-center cursor-pointer transition-colors ${
                dragOver ? 'border-primary bg-accent-dim' : 'border-border hover:border-border-hover'
              }`}
            >
              <UploadIcon />
              <p className="text-foreground text-sm mt-3 mb-1 font-medium">
                {loading ? 'Extraction en cours...' : 'Glissez-déposez votre fichier ici'}
              </p>
              <p className="text-muted-foreground text-xs">ou cliquez pour parcourir</p>
              <div className="flex gap-2 mt-4">
                {formats.map(f => (
                  <span key={f} className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-full">{f}</span>
                ))}
              </div>
            </div>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Collez votre cours, vos notes ou tout texte ici..."
              className="w-full h-44 bg-background border border-border rounded-input px-3 py-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{text.length} caractères</span>
                {text.length >= 30 && (
                  <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full">Prêt</span>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={text.length < 30}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-btn text-sm font-medium btn-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Générer les flashcards
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {features.map((f, i) => (
          <div key={i} className="bg-card border border-border rounded-card p-5 animate-fadeUp" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
            <div className="w-9 h-9 rounded-btn bg-accent-dim flex items-center justify-center text-primary mb-3">{f.icon}</div>
            <h3 className="text-foreground text-sm font-semibold mb-1">{f.title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
