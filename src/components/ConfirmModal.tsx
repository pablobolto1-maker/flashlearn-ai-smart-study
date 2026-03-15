interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }} onClick={onCancel}>
      <div className="bg-card border border-border rounded-card p-6 w-full max-w-sm mx-4 animate-pop" onClick={e => e.stopPropagation()}>
        <h3 className="text-foreground font-semibold text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-btn text-sm text-muted-foreground hover:text-foreground border border-border btn-hover transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-btn text-sm bg-destructive text-foreground btn-hover transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
