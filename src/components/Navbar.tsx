import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="#22d3ee" />
    <rect x="6" y="6" width="8" height="8" rx="2" fill="#0c0e12" />
    <rect x="18" y="6" width="8" height="8" rx="2" fill="#0c0e12" />
    <rect x="6" y="18" width="8" height="8" rx="2" fill="#0c0e12" />
    <rect x="18" y="18" width="8" height="8" rx="2" fill="#0c0e12" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/library', label: 'Bibliothèque' },
  { to: '/progress', label: 'Progression' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border" style={{ backgroundColor: 'hsl(var(--navbar-bg))', backdropFilter: 'blur(10px)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2.5 btn-hover">
          <Logo />
          <span className="font-semibold text-foreground text-base">FlashLearn AI</span>
        </Link>
        <div className="flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-btn text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-accent-dim text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm text-muted-foreground hover:text-foreground btn-hover transition-colors">
          <LogoutIcon />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}
