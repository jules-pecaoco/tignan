import type { Alert } from '../types';
import { Circle, LogOut } from 'lucide-react';
import { signOut } from '../lib/auth.ts';
import type { Profile, RescuerProfile } from '../lib/auth.ts';

interface SidebarProps {
  alerts: Alert[];
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  rescuerStatus: string;
  rescuerData: RescuerProfile;
  profile: Profile;
}

const getRelativeTime = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'sending': return 'bg-warning';
    case 'api': 
    case 'resolved': return 'bg-success';
    case 'sms': return 'bg-warning';
    default: return 'bg-muted';
  }
};

const getBorderAccent = (alert: Alert) => {
  if (alert.acknowledged_at) return '#639922'; // success
  if (alert.status === 'resolved') return '#444441'; // border/muted
  return '#E24B4A'; // accent
};

export default function Sidebar({ alerts, selectedAlertId, onSelectAlert, rescuerStatus, rescuerData, profile }: SidebarProps) {
  const isAvailable = rescuerStatus === 'available';

  return (
    <div className="w-[280px] bg-card border-r border-border flex flex-col overflow-y-auto">
      
      {/* Rescuer Header */}
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[13px] text-primary font-bold uppercase tracking-tight">
            {rescuerData.callsign}
          </span>
          <div className="flex items-center gap-1.5">
            <Circle size={8} className={isAvailable ? 'text-success fill-success' : 'text-warning fill-warning'} />
            <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${isAvailable ? 'text-success' : 'text-warning'}`}>
              {isAvailable ? 'AVAILABLE' : 'ON MISSION'}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-muted font-medium">
          {profile.full_name}
        </span>
      </div>

      <div className="p-4 border-b border-border bg-background/30">
        <h2 className="font-mono text-[11px] text-muted font-bold tracking-[0.15em] uppercase">TIGNAN OPS</h2>
      </div>

      <div className="p-3 flex flex-col gap-2.5 flex-1">
        {alerts.map(alert => {
             const isSelected = selectedAlertId === alert.id;
             return (
              <div 
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                style={{ borderLeftColor: getBorderAccent(alert) }}
                className={`bg-border/30 p-4 cursor-pointer border-l-4 transition-all hover:bg-border/50 ${isSelected ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-transparent'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm text-primary uppercase tracking-tight line-clamp-1">{alert.name}</span>
                  <span className="font-mono text-[11px] text-muted whitespace-nowrap ml-2">
                    {getRelativeTime(alert.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColorClass(alert.status)}`} />
                  <span className="font-mono text-[10px] text-muted font-bold uppercase tracking-widest">{alert.status}</span>
                </div>
                {alert.rescuer_callsign && (
                  <div className="mt-2.5 pt-2 border-t border-border/50">
                    <span className="font-mono text-[10px] text-success font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span className="opacity-50">BY</span> {alert.rescuer_callsign}
                    </span>
                  </div>
                )}
              </div>
             );
        })}
        {alerts.length === 0 && (
          <div className="p-8 text-center bg-background/20 rounded-lg border border-dashed border-border/50">
            <span className="font-mono text-[11px] text-muted font-bold uppercase tracking-widest">NO ACTIVE ALERTS</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-background/50 mt-auto">
        <button 
          onClick={() => signOut()}
          className="bg-transparent border-none flex items-center gap-2.5 text-muted hover:text-accent transition-colors font-mono text-[11px] font-bold uppercase tracking-widest cursor-pointer outline-none w-full group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" /> 
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
}
