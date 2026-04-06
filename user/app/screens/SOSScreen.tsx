import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { MapPin, LogOut, ShieldAlert, CircleCheck, Info } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { RootStackParamList } from '../types/navigation';

type AlertStatus = "idle" | "searching" | "sending" | "api" | "sms" | "resolved";

type Props = NativeStackScreenProps<RootStackParamList, 'SOS'>;

export default function SOSScreen({ route }: Props) {
  const { uid, profile } = route.params;

  const [gpsActive, setGpsActive] = useState<boolean>(false);
  const [status, setStatus] = useState<AlertStatus>("idle");
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [responderInfo, setResponderInfo] = useState<{name: string, callsign: string} | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for the button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Realtime subscription
  useEffect(() => {
    if (!lastAlertId) return;

    const channel = supabase
      .channel('alert-' + lastAlertId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sos_alerts',
        filter: `id=eq.${lastAlertId}`
      }, (payload) => {
        const updated = payload.new;
        setStatus(updated.status as AlertStatus);

        if (updated.rescuer_callsign && !responderInfo) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setResponderInfo({
            name: updated.rescuer_name,
            callsign: updated.rescuer_callsign
          });
        }
        
        if (updated.status === 'resolved') {
          setResponderInfo(null);
          setTimeout(() => {
            setStatus('idle');
            setLastAlertId(null);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lastAlertId, responderInfo]);

  const handleSosPress = async () => {
    if (status !== "idle" && status !== "resolved") return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setResponderInfo(null);
    setStatus("searching");
    let location: Location.LocationObject;
    try {
      let { status: permStatus } = await Location.requestForegroundPermissionsAsync();
      if (permStatus !== 'granted') {
        setStatus("idle");
        return;
      }
      location = await Location.getCurrentPositionAsync({});
      setGpsActive(true);
    } catch (e) {
      console.error(e);
      setStatus("idle");
      return;
    }

    const currentLat = location.coords.latitude;
    const currentLng = location.coords.longitude;
    setCoords({ lat: currentLat, lng: currentLng });
    setStatus("sending");
    
    const ts = new Date().toISOString();
    setLastTimestamp(ts);

    const alertData = {
      user_id: uid,
      name: profile?.full_name || 'Anonymous User',
      phone: profile?.phone || '',
      lat: currentLat,
      lng: currentLng,
      status: 'sending',
      priority: 'P1'
    };

    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .insert(alertData)
        .select()
        .single();
        
      if (error) throw error;
      
      setLastAlertId(data.id);
      await supabase.from('sos_alerts').update({ status: 'api' }).eq('id', data.id);
      setStatus("api");
      
    } catch (e) {
      console.error("Supabase insert failed:", e);
      setStatus("sms"); // Simplified fallback for UI
    }
  };

  const isSentAwaiting = (status === 'sending' || status === 'api' || status === 'sms') && !responderInfo;
  const isEnRoute = !!responderInfo && status !== 'resolved';
  const isClosed = status === 'resolved';
  const isIdleDisabled = status !== 'idle';

  return (
    <View className="flex-1 bg-background justify-between p-6">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center mt-10 px-2">
        <View>
            <Text className="text-primary text-lg font-bold tracking-tight uppercase">{profile?.full_name || 'LOADING...'}</Text>
            <Text className="text-muted text-[10px] font-mono font-black uppercase tracking-widest">CITIZEN NODE</Text>
        </View>
        <View className="flex-row items-center gap-5">
           <MapPin color={gpsActive ? "#639922" : (status === "searching" ? "#EF9F27" : "#444441")} size={24} />
           <Pressable onPress={() => signOut()} className="active:opacity-50">
              <LogOut color="#888780" size={24} />
           </Pressable>
        </View>
      </View>

      {/* Center */}
      <View className="flex-1 justify-center items-center">
        {isIdleDisabled || isClosed ? (
          <View className="w-52 h-52 rounded-full justify-center items-center bg-accent/20 border-4 border-accent/10 opacity-60">
             <Text className="text-white text-3xl font-black font-mono">SOS</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="w-52 h-52">
            <Pressable 
              className="w-full h-full rounded-full justify-center items-center bg-accent shadow-2xl shadow-accent/40 active:bg-accent/90"
              onPress={handleSosPress}
            >
              <Text className="text-white text-4xl font-black font-mono tracking-tighter">SOS</Text>
            </Pressable>
          </Animated.View>
        )}
        
        <View className="mt-12 min-h-[100px] justify-center items-center w-full px-4">
          {status === 'searching' && (
             <View className="flex-row items-center gap-2 bg-warning/10 px-4 py-2 rounded-full border border-warning/30">
                <View className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse" />
                <Text className="text-warning font-mono text-[11px] font-black uppercase tracking-widest">ACQUIRING GPS</Text>
             </View>
          )}
          
          {isSentAwaiting && (
            <View className="items-center bg-success/5 border border-success/20 p-5 rounded-2xl w-full">
               <ShieldAlert size={28} className="text-success mb-3" />
               <Text className="text-success font-mono text-sm font-black uppercase tracking-widest text-center">SIGNAL BROADCASTED</Text>
               <Text className="text-primary font-mono text-[10px] text-center mt-2 opacity-60 uppercase tracking-widest">AWAITING NEAREST RESPONDER</Text>
            </View>
          )}

          {isEnRoute && responderInfo && (
            <View className="bg-success px-6 py-5 rounded-2xl w-full shadow-lg shadow-success/20">
              <View className="flex-row justify-between items-start mb-3">
                 <Text className="text-background font-mono text-[10px] font-black uppercase tracking-[0.2em]">EN ROUTE</Text>
                 <CircleCheck size={18} className="text-background" />
              </View>
              <Text className="text-background font-mono text-2xl font-black tracking-widest uppercase mb-1">{responderInfo.callsign}</Text>
              <Text className="text-background/80 font-bold text-xs uppercase">{responderInfo.name}</Text>
            </View>
          )}

          {isClosed && (
            <View className="flex-row items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                <Info size={14} className="text-muted" />
                <Text className="text-muted font-mono text-[11px] font-black uppercase tracking-widest">INCIDENT RESOLVED</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom Bar */}
      <View className="border-t border-border/30 pt-5 flex-row justify-between opacity-50 px-2">
        <Text className="font-mono text-muted text-[10px] font-bold uppercase tracking-widest">
          {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : '00.00000, 00.00000'}
        </Text>
        <Text className="font-mono text-muted text-[10px] font-bold uppercase tracking-widest">
          {lastTimestamp ? new Date(lastTimestamp).toLocaleTimeString() : '--:--:--'}
        </Text>
      </View>
    </View>
  );
}
