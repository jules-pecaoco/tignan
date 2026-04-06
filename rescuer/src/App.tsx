import { useEffect, useState, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { getSession, getProfile, signOut } from "./lib/auth.ts";
import type { Profile, RescuerProfile } from "./lib/auth.ts";
import type { Alert } from "./types";
import Sidebar from "./components/Sidebar";
import MapView from "./components/MapView";
import DetailPanel from "./components/DetailPanel";

import LoginScreen from "./screens/LoginScreen.tsx";
import RegisterScreen from "./screens/RegisterScreen.tsx";
import PendingScreen from "./screens/PendingScreen.tsx";

function OpsDashboard({ session, profile, rescuerData }: { session: any, profile: Profile, rescuerData: RescuerProfile }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [rescuerStatus, setRescuerStatus] = useState<string>(rescuerData.status);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase.from("sos_alerts").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setAlerts(data);
      }
    };
    fetchAlerts();

    const alertsChannel = supabase
      .channel("public:sos_alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        (payload) => {
          if (payload.eventType === "INSERT") setAlerts((prev) => [payload.new as Alert, ...prev]);
          else if (payload.eventType === "UPDATE") setAlerts((prev) => prev.map((a) => (a.id === payload.new.id ? payload.new as Alert : a)));
        },
      )
      .subscribe();

    const rescuerChannel = supabase
      .channel("public:rescuers")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rescuer_profiles", filter: `id=eq.${session.user.id}` },
        (payload) => setRescuerStatus(payload.new.status)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
      supabase.removeChannel(rescuerChannel);
    };
  }, [session.user.id]);

  const selectedAlert = useMemo(() => alerts.find((a) => a.id === selectedAlertId) || null, [alerts, selectedAlertId]);

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      <Sidebar 
        alerts={alerts} 
        selectedAlertId={selectedAlertId} 
        onSelectAlert={setSelectedAlertId} 
        rescuerStatus={rescuerStatus}
        rescuerData={rescuerData}
        profile={profile}
      />
      <div className="flex-1 relative">
        <MapView alerts={alerts} selectedAlertId={selectedAlertId} onSelectAlert={setSelectedAlertId} />
      </div>
      <DetailPanel 
        alert={selectedAlert} 
        onCloseAlert={() => setSelectedAlertId(null)} 
        rescuerData={rescuerData}
        profile={profile}
      />
    </div>
  );
}

function AuthWrapper() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rescuerData, setRescuerData] = useState<RescuerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function initAuth() {
      const sess = await getSession();
      if (sess?.user) {
        const prof = await getProfile(sess.user.id);
        if (prof) {
           if (prof.role === 'rescuer') {
              const { data } = await supabase.from('rescuer_profiles').select('*').eq('id', sess.user.id).single();
              if (mounted) {
                 setSession(sess);
                 setProfile(prof);
                 setRescuerData(data as RescuerProfile);
                 if (data && !data.verified) navigate('/pending', { replace: true });
                 else navigate('/ops', { replace: true });
              }
           } else if (prof.role === 'admin') {
              if (mounted) {
                 await signOut();
                 navigate('/login');
              }
           } else {
              if (mounted) {
                 await signOut();
                 navigate('/login');
               }
           }
        } else {
           // Fallback if profile fails
           if (mounted) {
              await signOut();
              navigate('/login');
           }
        }
      } else {
         if (mounted && location.pathname !== '/register') {
           navigate('/login', { replace: true });
         }
      }
      if (mounted) setLoading(false);
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (mounted) {
         if (!sess) {
            setSession(null);
            setProfile(null);
            setRescuerData(null);
            if (location.pathname !== '/register') {
               navigate('/login', { replace: true });
            }
         } else {
            initAuth();
         }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <div className="h-screen bg-background" />;

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/pending" element={<PendingScreen />} />
      <Route path="/ops" element={ session && profile && rescuerData ? <OpsDashboard session={session} profile={profile} rescuerData={rescuerData} /> : <Navigate to="/login" /> } />
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
