import { useState } from 'react';
import { signIn } from '../lib/auth.ts';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, LogIn, AlertTriangle } from 'lucide-react';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      // If error is "Invalid login credentials", it might be unconfirmed email.
      if (result.error.toLowerCase().includes('invalid login credentials')) {
         setError('Invalid credentials, or email is not yet confirmed. Please check your inbox.');
      } else {
         setError(result.error);
      }
    }
  };

  return (
    <div className="auth-split">
      {/* ── Left Hero Panel ── */}
      <div className="auth-hero">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={28} className="text-accent" />
            <span className="font-mono text-xl tracking-[0.25em] font-black text-primary uppercase">
              TIGNAN
            </span>
          </div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted uppercase">
            SOS Response Network
          </p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-black text-primary leading-tight tracking-tight mb-4">
              Operator
              <br />
              <span className="text-accent">Login</span>
            </h1>
            <p className="text-sm text-muted leading-relaxed max-w-[320px]">
              Access the operations dashboard to monitor emergencies, coordinate dispatch, and respond to SOS alerts across the network.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
            <h3 className="font-mono text-[10px] tracking-[0.15em] text-accent font-bold uppercase mb-2">Restricted Access</h3>
            <p className="text-[11px] text-muted">
              This system is restricted to verified rescue organizations and administrative personnel only. Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-[11px] text-muted font-mono font-bold uppercase tracking-widest no-underline hover:text-primary transition-colors"
          >
            NEW RESCUER? REGISTER HERE
          </Link>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <form onSubmit={handleLogin} className="max-w-[480px] w-full mx-auto space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <LogIn size={20} className="text-accent" />
              <h2 className="section-label mb-0 text-sm">Authentication</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="section-label block">Email Address</label>
                <input
                  type="email"
                  placeholder="operator@organization.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="section-label block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-4 rounded-lg font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer ${
              loading
                ? 'bg-muted/20 text-muted cursor-not-allowed'
                : 'bg-accent text-white hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AUTHENTICATING...
              </>
            ) : (
              <>
                SIGN IN SECURELY
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {error && (
            <div className="flex items-start gap-3 bg-accent/10 text-accent p-4 rounded-lg text-[13px] border border-accent/20">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
