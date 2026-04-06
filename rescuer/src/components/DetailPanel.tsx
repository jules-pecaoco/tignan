import React, { useState } from 'react';
import type { Alert } from '../types';
import { CheckCircle, Navigation, X } from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import type { Profile, RescuerProfile } from '../lib/auth.ts';

interface DetailPanelProps {
  alert: Alert | null;
  onCloseAlert: () => void;
  rescuerData: RescuerProfile;
  profile: Profile;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ alert, onCloseAlert, rescuerData, profile }) => {
  const [updating, setUpdating] = useState(false);

  const handleAcknowledge = async () => {
    if (!alert) return;
    setUpdating(true);
    try {
      const now = new Date().toISOString();
      const { error: alertError } = await supabase
        .from('sos_alerts')
        .update({
          rescuer_id: rescuerData.id,
          rescuer_name: profile.full_name,
          rescuer_callsign: rescuerData.callsign,
          rescuer_assigned_at: now,
          acknowledged_at: now,
          status: 'api'
        })
        .eq('id', alert.id);

      if (alertError) throw alertError;

      const { error: rescuerError } = await supabase
        .from('rescuer_profiles')
        .update({ status: 'busy' })
        .eq('id', rescuerData.id);

      if (rescuerError) throw rescuerError;
    } catch (e) {
      console.error("Failed to acknowledge", e);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!alert) return;
    setUpdating(true);
    try {
      const { error: alertError } = await supabase
        .from('sos_alerts')
        .update({ status: 'resolved' })
        .eq('id', alert.id);

      if (alertError) throw alertError;

      const { error: rescuerError } = await supabase
        .from('rescuer_profiles')
        .update({ status: 'available' })
        .eq('id', rescuerData.id);

      if (rescuerError) throw rescuerError;
    } catch (e) {
      console.error("Failed to resolve", e);
    } finally {
      setUpdating(false);
    }
  };

  if (!alert) {
    return (
      <div className="w-[320px] bg-card border-l border-border flex flex-col justify-center items-center text-muted p-5">
        <span className="font-mono text-[13px] font-bold uppercase tracking-widest">SELECT AN ALERT</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sending': return '#EF9F27'; // warning
      case 'api': 
      case 'resolved': return '#639922'; // success
      case 'sms': return '#EF9F27'; // warning
      default: return '#888780'; // muted
    }
  };

  const isUnassigned = !alert.rescuer_id;
  const isMine = alert.rescuer_id === rescuerData.id;
  
  let ackText = "ACKNOWLEDGE";
  if (!isUnassigned && !isMine) ackText = `CLAIMED BY ${alert.rescuer_callsign}`;

  return (
    <div className="w-[320px] bg-card border-l border-border flex flex-col p-5 overflow-y-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-2xl font-black text-primary uppercase tracking-tight leading-tight">{alert.name}</h1>
          <button onClick={onCloseAlert} className="text-muted hover:text-primary transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="bg-primary/5 px-2 py-1 rounded border-l-2"
            style={{ borderLeftColor: getStatusColor(alert.status) }}
          >
            <span 
              className="font-mono text-[10px] font-black uppercase tracking-widest"
              style={{ color: getStatusColor(alert.status) }}
            >
              {alert.status}
            </span>
          </div>
          <p className="font-mono text-muted text-sm tracking-tight">{alert.phone}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-auto">
        <div className="group">
          <p className="font-mono text-[10px] text-muted font-black tracking-[0.15em] mb-1.5 uppercase opacity-60">COORDINATES</p>
          <p className="font-mono text-xs text-primary bg-background/50 p-2 rounded border border-border/30">{alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted font-black tracking-[0.15em] mb-1.5 uppercase opacity-60">TIMESTAMP</p>
          <p className="font-mono text-[11px] text-primary">{new Date(alert.created_at).toLocaleString()}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted font-black tracking-[0.15em] mb-1.5 uppercase opacity-60">ASSIGNED TO</p>
          {alert.rescuer_id ? (
            <div className="bg-success/5 border border-success/20 p-2 rounded">
              <p className="font-mono text-[11px] text-success font-bold uppercase tracking-tight leading-relaxed">
                {alert.rescuer_callsign}
              </p>
              <p className="font-mono text-[10px] text-success/70 uppercase">{alert.rescuer_name}</p>
            </div>
          ) : (
            <p className="font-mono text-[11px] text-muted font-bold uppercase tracking-widest opacity-40">UNASSIGNED</p>
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] text-muted font-black tracking-[0.15em] mb-1.5 uppercase opacity-60">ACKNOWLEDGED</p>
          {alert.acknowledged_at ? (
            <p className="font-mono text-[11px] text-primary bg-background/50 p-2 rounded border border-border/30">
              {new Date(alert.acknowledged_at).toLocaleTimeString()}
            </p>
          ) : (
            <p className="font-mono text-[11px] text-muted opacity-40">—</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mt-8">
        <button 
          disabled={updating || (!isUnassigned && !isMine)}
          onClick={handleAcknowledge}
          className={`flex items-center justify-center gap-2.5 w-full p-4 border rounded-lg font-bold text-xs tracking-widest transition-all uppercase outline-none
            ${updating || (!isUnassigned && !isMine) 
              ? 'bg-border/20 border-border/30 text-muted cursor-not-allowed opacity-50' 
              : 'bg-accent/10 border-accent/40 text-accent hover:bg-accent hover:text-white cursor-pointer active:scale-[0.98]'
            }`}
        >
          {isUnassigned || isMine ? <CheckCircle size={16} /> : null}
          {ackText}
        </button>

        <button 
          disabled={updating || !isMine || alert.status === 'resolved'}
          onClick={handleResolve}
          className={`flex items-center justify-center gap-2.5 w-full p-4 border rounded-lg font-bold text-xs tracking-widest transition-all uppercase outline-none
            ${updating || !isMine || alert.status === 'resolved'
              ? 'bg-border/20 border-border/30 text-muted cursor-not-allowed opacity-50' 
              : 'bg-success/10 border-success/40 text-success hover:bg-success hover:text-white cursor-pointer active:scale-[0.98]'
            }`}
        >
          <Navigation size={16} /> 
          {alert.status === 'resolved' ? 'RESOLVED' : 'RESOLVE'}
        </button>
      </div>
    </div>
  );
};

export default DetailPanel;
