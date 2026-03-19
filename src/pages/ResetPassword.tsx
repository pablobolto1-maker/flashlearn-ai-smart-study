import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Erreur lors de la réinitialisation');
    } else {
      toast.success('Mot de passe mis à jour avec succès');
      navigate('/');
    }
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
          {recovery ? (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-1 text-center">
                Nouveau mot de passe
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Entrez votre nouveau mot de passe
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Min. 6 caractères"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-background border border-border rounded-input px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    placeholder="Confirmez votre mot de passe"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-btn btn-hover transition-all disabled:opacity-50"
                >
                  {loading ? 'Chargement...' : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold text-foreground mb-2">Lien invalide ou expiré</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-primary hover:underline text-sm"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
