import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { signIn } from '../../lib/auth';

type Props = NativeStackScreenProps<any, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } 
  };

  return (
    <View className="flex-1 bg-card justify-center p-6 items-center">
      <View className="w-full max-w-[360px] items-center mb-10">
        <Text className="text-3xl font-bold font-mono text-primary mb-1 uppercase tracking-tighter">TIGNAN</Text>
        <Text className="text-[10px] text-muted font-mono tracking-[0.15em] mb-4 uppercase">EMERGENCY RESPONSE SYSTEM</Text>
        <View className="w-full h-[1px] bg-border" />
      </View>

      <View className="w-full max-w-[360px] space-y-4 mb-10">
        <View className="space-y-1">
          <Text className="text-[10px] text-muted font-mono font-bold uppercase tracking-widest ml-1">USER EMAIL</Text>
          <TextInput
            className="bg-background border border-border text-primary font-mono p-4 rounded-lg text-sm"
            placeholder="EMAIL@EXAMPLE.COM"
            placeholderTextColor="#888780"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="space-y-1 mt-4">
          <Text className="text-[10px] text-muted font-mono font-bold uppercase tracking-widest ml-1">SECURITY PASSWORD</Text>
          <TextInput
            className="bg-background border border-border text-primary font-mono p-4 rounded-lg text-sm"
            placeholder="••••••••"
            placeholderTextColor="#888780"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Pressable 
          className={`bg-accent p-5 rounded-xl items-center mt-6 shadow-lg shadow-accent/20 active:opacity-80 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="color-white font-bold font-mono text-sm tracking-widest uppercase">SIGN IN</Text>
          )}
        </Pressable>
        {error && <Text className="text-accent font-mono text-xs text-center mt-4 uppercase tracking-tight bg-accent/5 py-2 rounded">{error}</Text>}
      </View>

      <View className="w-full max-w-[360px] items-center">
        <Pressable onPress={() => navigation.navigate('Register')} className="active:opacity-60">
          <Text className="text-primary font-mono text-[11px] font-bold uppercase tracking-widest underline decoration-border underline-offset-4">REGISTER NEW ACCOUNT</Text>
        </Pressable>
      </View>
    </View>
  );
}
