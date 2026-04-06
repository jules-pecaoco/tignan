import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getSession, getProfile, signOut } from './lib/auth.ts';
import type { Profile } from './lib/auth.ts';
import LoginScreen from './screens/LoginScreen.tsx';
import VerificationQueue from './screens/VerificationQueue.tsx';

function AuthWrapper() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const sess = await getSession();
      if (sess?.user) {
        const prof = await getProfile(sess.user.id);
        if (mounted) {
          if (prof?.role === 'admin') {
            setSession(sess);
            setProfile(prof);
            navigate('/queue', { replace: true });
          } else {
            await signOut();
            navigate('/login', { replace: true });
          }
        }
      } else {
        if (mounted) {
           // On initial load if no session, just stop loading and stay on login
           setLoading(false);
        }
      }
      if (mounted) setLoading(false);
    }

    initAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-1 bg-border relative overflow-hidden rounded-full">
           <div className="absolute inset-0 bg-accent translate-x-[-100%] animate-[shimmer_1.5s_infinite]" style={{ animation: 'shimmer 1.5s infinite linear' }} />
        </div>
        <div className="font-mono text-muted text-[10px] font-black tracking-[0.2em] uppercase">VERIFYING ADMIN CONTEXT</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route 
        path="/queue" 
        element={session && profile?.role === 'admin' ? <VerificationQueue /> : <Navigate to="/login" />} 
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthWrapper />
    </BrowserRouter>
  );
}
