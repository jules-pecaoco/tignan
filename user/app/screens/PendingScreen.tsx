import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Clock } from 'lucide-react-native';
import { signOut } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

export default function PendingScreen({ route, navigation }: Props) {
  const uid = route.params?.uid;

  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel('public:rescuer_profiles')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'rescuer_profiles',
        filter: `id=eq.${uid}`
      }, (payload) => {
        if (payload.new.verified) {
           // Verification handled by App root router session watcher
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View className="flex-1 bg-card justify-center items-center p-8">
      <Clock size={56} className="text-warning mb-8" />
      <Text className="text-primary font-mono text-lg font-bold mb-3 uppercase tracking-widest text-center">VERIFICATION PENDING</Text>
      <Text className="text-muted text-sm mb-2 text-center">Your rescuer application is under review.</Text>
      <Text className="text-muted text-xs text-center mb-14 opacity-70">You will be notified once an admin approves your account.</Text>

      <Pressable onPress={handleSignOut} className="p-3 active:opacity-60">
        <Text className="text-primary font-mono text-xs font-bold uppercase tracking-widest underline decoration-border underline-offset-4">SIGN OUT</Text>
      </Pressable>
    </View>
  );
}
