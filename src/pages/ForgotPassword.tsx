import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'envoi");
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
          {sent ? (
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Vérifiez votre boîte mail</h2>
              <p className="text-sm text-muted-foreground">
                Un email de réinitialisation a été envoyé à <span className="text-foreground font-medium">{email}</span>.
              </p>
              <Link to="/" className="text-sm text-primary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-1 text-center">Mot de passe oublié</h2>
              <p className="text-sm text-muted-foreground text-center mb-5">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-medium py-2.5 rounded-btn btn-hover transition-all disabled:opacity-50"
                >
                  {loading ? 'Envoi...' : 'Envoyer'}
                </button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-4">
                <Link to="/" className="text-primary hover:underline">Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
