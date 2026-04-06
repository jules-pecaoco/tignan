import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { signOut, getSession } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default function PendingScreen() {
  useEffect(() => {
    let channel: any;
    
    getSession().then((session) => {
      if (session) {
        channel = supabase
          .channel('public:rescuer_profiles:web')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'rescuer_profiles',
            filter: `id=eq.${session.user.id}`
          }, (payload) => {
            if (payload.new.verified) {
                // Verified now! Reload to let auth guard take over.
                window.location.href = '/ops';
            }
          })
          .subscribe();
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-card text-primary p-8">
      <Clock size={48} className="text-warning mb-6" />
      <h2 className="font-mono mb-3 text-base font-bold uppercase tracking-wider text-center">VERIFICATION PENDING</h2>
      <p className="mb-2 text-muted text-sm text-center">Your rescuer application is under review.</p>
      <p className="mb-12 text-muted text-xs text-center opacity-70">You will be notified once an admin approves your account.</p>

      <button 
        onClick={() => signOut()}
        className="bg-transparent border-none text-primary cursor-pointer font-mono text-xs underline decoration-border underline-offset-4 hover:text-accent transition-colors"
      >
        SIGN OUT
      </button>
    </div>
  );
}
