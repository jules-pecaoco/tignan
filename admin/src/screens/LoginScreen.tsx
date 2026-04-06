import { useState } from 'react';
import { signIn } from '../lib/auth.ts';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Auth guard in App.tsx maps navigation on session success
      navigate('/queue', { replace: true });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="font-mono text-3xl text-primary font-black mb-1 tracking-tighter uppercase">TIGNAN</h1>
        <p className="font-mono text-[10px] text-muted font-bold tracking-[0.2em] mb-7 uppercase">TIGNAN ADMIN PORTAL</p>
        
        <div className="h-px bg-border mb-8 shadow-sm" />
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-muted font-black tracking-widest uppercase ml-1">ADMIN EMAIL</label>
            <input
              type="email"
              placeholder="operator@tignan.gov"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-muted font-black tracking-widest uppercase ml-1">SECURE PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button 
             type="submit" 
             disabled={loading}
             className={`mt-4 w-full p-4 rounded-lg font-mono font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98]
               ${loading ? 'bg-accent/50 text-white/50 cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90 cursor-pointer'} 
             `}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
        {error && <p className="font-mono text-accent text-xs font-bold text-center mt-6 tracking-tight uppercase bg-accent/5 py-2 rounded">{error}</p>}
      </div>
    </div>
  );
}
