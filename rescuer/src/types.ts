export type AlertStatus = "idle" | "searching" | "sending" | "api" | "sms" | "resolved";

export interface Alert {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  status: AlertStatus;
  priority: string;
  created_at: string;
  rescuer_id?: string;
  rescuer_name?: string;
  rescuer_callsign?: string;
  rescuer_assigned_at?: string;
  acknowledged_at?: string;
}
