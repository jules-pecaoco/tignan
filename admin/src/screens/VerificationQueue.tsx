import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { LogOut, Clock, CheckCircle, XCircle } from 'lucide-react';
import { signOut } from '../lib/auth.ts';
import Toast from '../components/Toast.tsx';
import type { ToastType } from '../components/Toast.tsx';

interface RescuerWithProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  id_number: string;
  id_image_url: string;
  callsign: string;
  gps_lat: number;
  gps_lng: number;
  org_name: string;
  org_type: string;
  created_at: string;
}

const STORAGE_URL = `https://wihftgoocfnwthuhrkip.supabase.co/storage/v1/object/public/tignan-assets/`;
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function VerificationQueue() {
  const [pending, setPending] = useState<RescuerWithProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);

  useEffect(() => {
    fetchPending();

    const channel = supabase
      .channel('pending-rescuers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rescuer_profiles' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rescuer_profiles')
      .select(`
        id,
        id_number,
        id_image_url,
        callsign,
        gps_lat,
        gps_lng,
        org_name,
        org_type,
        profiles!rescuer_profiles_id_fkey (
          full_name,
          email,
          phone,
          address,
          created_at
        )
      `)
      .eq('verified', false);

    if (!error && data) {
      const mapped = data.map((item: any) => ({
        id: item.id,
        id_number: item.id_number,
        id_image_url: item.id_image_url,
        callsign: item.callsign,
        gps_lat: item.gps_lat,
        gps_lng: item.gps_lng,
        org_name: item.org_name,
        org_type: item.org_type,
        full_name: item.profiles.full_name,
        email: item.profiles.email,
        phone: item.profiles.phone,
        address: item.profiles.address,
        created_at: item.profiles.created_at
      }));
      setPending(mapped);
    }
    setLoading(false);
  };

  const selected = pending.find(p => p.id === selectedId);

  const handleApprove = async () => {
    if (!selected) return;

    const { data: existing } = await supabase
      .from('rescuer_profiles')
      .select('id')
      .eq('callsign', selected.callsign)
      .neq('id', selected.id)
      .single();

    if (existing) {
      setToast({ message: 'CALLSIGN ALREADY TAKEN', type: 'error' });
      return;
    }

    const { error } = await supabase
      .from('rescuer_profiles')
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
        status: 'available'
      })
      .eq('id', selected.id);

    if (error) {
      setToast({ message: 'APPROVAL FAILED', type: 'error' });
    } else {
      setToast({ message: `RESCUER APPROVED — ${selected.callsign}`, type: 'success' });
      setPending(prev => prev.filter(p => p.id !== selected.id));
      setSelectedId(null);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    const { error } = await supabase.from('profiles').delete().eq('id', selected.id);
    if (error) {
      setToast({ message: 'REJECTION FAILED', type: 'error' });
    } else {
      setToast({ message: 'RESCUER REJECTED', type: 'error' });
      setPending(prev => prev.filter(p => p.id !== selected.id));
      setSelectedId(null);
      setConfirmReject(false);
    }
  };

  const getRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}m ago`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex h-screen bg-background text-primary overflow-hidden">
      {/* Left Column: List */}
      <div className="w-[420px] border-r border-border flex flex-col bg-card/10">
        <div className="p-6 border-b border-border flex justify-between items-center bg-card/20 backdrop-blur-sm">
          <div>
            <h2 className="font-mono text-[11px] text-muted font-black tracking-[0.2em] uppercase">VERIFICATION QUEUE</h2>
            <div className="flex items-center gap-3 mt-3">
              <div className={`px-2 py-0.5 rounded-full font-bold text-[11px] transition-colors ${pending.length > 0 ? 'bg-warning text-background' : 'bg-border text-muted'}`}>
                {pending.length}
              </div>
              <span className="font-mono text-[11px] text-muted font-bold tracking-widest uppercase">PENDING</span>
            </div>
          </div>
          <button onClick={() => signOut()} className="text-muted hover:text-accent transition-colors outline-none focus:scale-110 active:scale-95">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pending.map(p => {
             const isSelected = selectedId === p.id;
             return (
              <div 
                key={p.id}
                onClick={() => { setSelectedId(p.id); setConfirmReject(false); }}
                className={`p-4 cursor-pointer transition-all border-l-4 group hover:bg-card/30 
                  ${isSelected ? 'bg-card border-warning ring-1 ring-warning/30' : 'bg-card/5 border-warning/30 hover:border-warning/60'}
                `}
              >
                <div className="font-black text-[15px] mb-1 uppercase tracking-tight group-hover:text-warning transition-colors">{p.org_name}</div>
                <div className="font-mono text-xs text-muted mb-1 font-bold">{p.org_type} — {p.phone}</div>
                <div className="text-xs text-muted/80 mb-2 truncate">{p.email}</div>
                <div className="text-xs text-muted/80 mb-4 line-clamp-1">{p.address}</div>
                <div className="flex justify-between items-center">
                   <span className="font-mono text-[11px] text-primary/70 font-black tracking-wider bg-background/50 px-2 py-0.5 rounded">ID: {p.id_number}</span>
                   <span className="font-mono text-[10px] text-muted font-bold">{getRelativeTime(p.created_at)}</span>
                </div>
              </div>
             );
          })}
          {!loading && pending.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
              <Clock size={40} className="mb-4 text-muted" />
              <p className="font-mono text-[11px] font-black tracking-[0.2em] uppercase">QUEUE EMPTY</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Detail */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {selected ? (
          <div className="flex-1 overflow-y-auto p-12 max-w-4xl w-full mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <section>
                <h2 className="font-mono text-[11px] text-muted font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted rounded-full" /> ORGANIZATION & CONTACT
                </h2>
                <div className="space-y-8">
                  <div className="group">
                    <p className="font-mono text-[10px] text-muted font-black tracking-widest mb-1.5 uppercase opacity-60">ORGANIZATION</p>
                    <p className="text-2xl font-black text-primary uppercase tracking-tight">{selected.org_name}</p>
                    <div className="flex gap-4 mt-2">
                       <p className="font-mono text-[10px] text-accent font-bold uppercase tracking-widest">TYPE: {selected.org_type}</p>
                       <p className="font-mono text-[10px] text-warning font-bold uppercase tracking-widest">CALLSIGN: {selected.callsign}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted font-black tracking-widest mb-1.5 uppercase opacity-60">CONTACT PERSON</p>
                    <p className="text-lg font-bold text-primary uppercase tracking-tight">{selected.full_name}</p>
                    <div className="flex gap-4 mt-1">
                      <p className="font-mono text-[11px] text-primary font-bold">{selected.phone}</p>
                      <p className="font-mono text-[11px] text-muted">{selected.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-muted font-black tracking-widest mb-1.5 uppercase opacity-60">HEADQUARTERS ADDRESS</p>
                    <p className="text-lg text-primary/90 font-medium leading-relaxed uppercase">{selected.address}</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="font-mono text-[11px] text-muted font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                   <div className="w-1 h-1 bg-muted rounded-full" /> GOVERNMENT ID
                </h2>
                <div className="bg-card/20 rounded-xl p-4 border border-border/50 group hover:border-warning/30 transition-all">
                  <p className="font-mono text-[10px] text-muted font-black tracking-widest mb-4 uppercase opacity-60">NUM: {selected.id_number}</p>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-background flex items-center justify-center relative border border-border/30">
                    <img 
                      src={`${STORAGE_URL}${selected.id_image_url}`} 
                      alt="ID Document" 
                      className="max-h-full max-w-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as any).style.display = 'none'; (e.target as any).parentElement.innerHTML = '<span class="font-mono text-[10px] text-muted font-black uppercase">IMAGE UNAVAILABLE</span>'; }}
                    />
                  </div>
                </div>
              </section>
            </div>

            <section className="mb-12">
              <h2 className="font-mono text-[11px] text-muted font-black tracking-[0.2em] uppercase mb-6 flex items-center gap-2">
                 <div className="w-1 h-1 bg-muted rounded-full" /> REGISTERED LOCATION
              </h2>
              <div className="rounded-xl overflow-hidden border border-border group hover:border-accent/30 transition-all">
                <img 
                  src={`https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${selected.gps_lng},${selected.gps_lat},13,0/800x400@2x?access_token=${MAPBOX_TOKEN}`}
                  alt="Registration Location Map"
                  className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-[2s]"
                />
                <div className="bg-card/40 p-3 flex justify-center items-center backdrop-blur-sm">
                  <p className="font-mono text-[11px] text-primary/70 font-black tracking-widest flex items-center gap-2 uppercase">
                    <MapPin size={12} className="text-accent" /> {selected.gps_lat.toFixed(6)}, {selected.gps_lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </section>

            <div className="border-t border-border pt-12 mt-12 space-y-8 pb-20">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-3 w-full p-5 rounded-xl font-mono font-black text-sm tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] bg-success text-white hover:bg-success/90 cursor-pointer shadow-success/20"
                >
                  <CheckCircle size={20} />
                  APPROVE & ACTIVATE '{selected.callsign}'
                </button>

                {confirmReject ? (
                  <div className="flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                    <button 
                      onClick={handleReject}
                      className="flex-1 bg-accent text-white p-5 rounded-xl font-mono font-black text-sm tracking-widest uppercase hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all active:scale-[0.98]"
                    >
                      CONFIRM REJECTION
                    </button>
                    <button 
                      onClick={() => setConfirmReject(false)}
                      className="flex-1 bg-card border border-border text-primary p-5 rounded-xl font-mono font-black text-sm tracking-widest uppercase hover:bg-background transition-all active:scale-[0.98]"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmReject(true)}
                    className="flex items-center justify-center gap-3 w-full p-5 bg-transparent border border-accent/40 text-accent rounded-xl font-mono font-black text-sm tracking-widest uppercase hover:bg-accent/5 transition-all active:scale-[0.98]"
                  >
                    <XCircle size={20} />
                    REJECT APPLICATION
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center opacity-40 px-12 text-center select-none">
            <span className="font-mono text-[13px] font-black tracking-[0.4em] uppercase border border-muted/30 px-6 py-3 rounded-full">SELECT AN APPLICATION TO REVIEW</span>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

const MapPin = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
