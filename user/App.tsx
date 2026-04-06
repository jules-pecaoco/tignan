import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { getSession, getProfile, Profile, RescuerProfile, supabase } from "./lib/auth";

import LoginScreen from "./app/screens/LoginScreen";
import RegisterScreen from "./app/screens/RegisterScreen";
import PendingScreen from "./app/screens/PendingScreen";
import SOSScreen from "./app/screens/SOSScreen";
import { RootStackParamList } from "./app/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rescuerData, setRescuerData] = useState<RescuerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadAuth(passedSess?: any) {
      if (mounted) setLoading(true);
      const sess = passedSess || (await getSession());
      if (mounted) setSession(sess);

      if (sess?.user) {
        const prof = await getProfile(sess.user.id);
        if (mounted) setProfile(prof);

        if (prof?.role === "rescuer") {
          const { data } = await supabase.from("rescuer_profiles").select("*").eq("id", sess.user.id).single();
          if (mounted) setRescuerData(data as RescuerProfile);
        }
      }
      if (mounted) setLoading(false);
    }

    loadAuth();

    supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (mounted) {
        if (!sess) {
          setSession(null);
          setProfile(null);
          setRescuerData(null);
          setLoading(false);
        } else {
          setLoading(true);
          // We pass the session to loadAuth to avoid fetching it again
          loadAuth(sess);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : profile?.role === "rescuer" && rescuerData && !rescuerData.verified ? (
          <Stack.Screen name="Pending" component={PendingScreen} initialParams={{ uid: session.user.id }} />
        ) : (
          <Stack.Screen name="SOS" component={SOSScreen} initialParams={{ uid: session.user.id, profile, rescuerData }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
