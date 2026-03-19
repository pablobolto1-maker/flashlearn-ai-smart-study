import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        navigate('/');
      } else {
        await signUp(email, password);
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fadeUp">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#22d3ee" />
            <rect x="6" y="6" width="8" height="8" rx="2" fill="#0c0e12" />
            <rect x="18" y="6" width="8" height="8" rx="2" fill="#0c0e12" />
            <rect x="6" y="18" width="8" height="8" rx="2" fill="#0c0e12" />
            <rect x="18" y="18" width="8" height="8" rx="2" fill="#0c0e12" />
          </svg>
          <span className="font-bold text-xl text-foreground">FlashLearn AI</span>
        </div>

        <div className="bg-card border border-border rounded-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-5">
            {isLogin ? 'Connectez-vous pour accéder à vos flashcards' : 'Inscrivez-vous pour commencer'}
          </p>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error rounded-input px-3 py-2 text-sm mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-success/10 border border-success/30 text-success rounded-input px-3 py-2 text-sm mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="vous@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-background border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="Min. 6 caractères"
              />
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) {
                        toast.error('Veuillez entrer votre email d\'abord');
                        return;
                      }
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: window.location.origin + '/reset-password',
                        });
                        if (error) throw error;
                        toast.success('Un email de réinitialisation a été envoyé');
                      } catch (err: any) {
                        toast.error(err.message || 'Erreur lors de l\'envoi');
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-btn btn-hover transition-all disabled:opacity-50"
            >
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            {isLogin ? "Pas de compte ?" : 'Déjà un compte ?'}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} className="text-primary hover:underline">
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
