import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Image } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { signUpUser } from "../../lib/auth";
import { Camera, Shield } from "lucide-react-native";

type Props = NativeStackScreenProps<any, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password || !fullName || !phone || !address) {
      setError("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const avatarObj = avatarUri ? { uri: avatarUri, name: "avatar.jpg", type: "image/jpeg" } : null;
      const result = await signUpUser({
        email,
        password,
        full_name: fullName,
        phone,
        address,
        avatar: avatarObj,
      });

      setLoading(false);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24, alignItems: "center" }}>
      <View className="items-center mb-8 mt-6">
        <Shield size={40} className="text-accent mb-3" />
        <Text className="text-lg text-primary font-mono font-bold tracking-widest uppercase">ENROLLMENT</Text>
        <Text className="text-[10px] text-muted font-mono tracking-widest mt-1 uppercase">TIGNAN SOS NETWORK</Text>
      </View>

      <View className="w-full max-w-[360px] space-y-6">
        <View className="space-y-4">
          <View className="space-y-1">
            <Text className="text-[10px] text-muted font-mono font-bold uppercase tracking-widest ml-1">PERSONAL DETAILS</Text>
            <TextInput
              className="bg-card border border-border text-primary font-mono p-4 rounded-lg text-sm"
              placeholder="FULL NAME"
              placeholderTextColor="#888780"
              value={fullName}
              onChangeText={setFullName}
            />
            <View className="flex-row gap-2 mt-2">
              <TextInput
                className="flex-1 bg-card border border-border text-primary font-mono p-3.5 rounded-lg text-xs"
                placeholder="PHONE (+63...)"
                placeholderTextColor="#888780"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                className="flex-1 bg-card border border-border text-primary font-mono p-3.5 rounded-lg text-xs"
                placeholder="BARANGAY"
                placeholderTextColor="#888780"
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View className="space-y-1 mt-2">
            <Text className="text-[10px] text-muted font-mono font-bold uppercase tracking-widest ml-1">ACCOUNT SECURITY</Text>
            <TextInput
              className="bg-card border border-border text-primary font-mono p-4 rounded-lg text-sm"
              placeholder="EMAIL ADDRESS"
              placeholderTextColor="#888780"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <View className="flex-row gap-2 mt-2">
              <TextInput
                className="flex-1 bg-card border border-border text-primary font-mono p-3.5 rounded-lg text-xs"
                placeholder="PASSWORD"
                placeholderTextColor="#888780"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                className="flex-1 bg-card border border-border text-primary font-mono p-3.5 rounded-lg text-xs"
                placeholder="CONFIRM"
                placeholderTextColor="#888780"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>
        </View>

        <View className="space-y-1 mt-2">
          <Text className="text-[10px] text-muted font-mono font-bold uppercase tracking-widest ml-1">PROFILE IMAGE (OPTIONAL)</Text>
          <Pressable
            className="flex-row items-center justify-center gap-2 border border-border border-dashed p-6 rounded-xl bg-card/10 active:bg-card/20 transition-colors"
            onPress={pickAvatar}
          >
            <Camera size={20} className="text-primary" />
            <Text className="text-primary font-mono text-[11px] font-bold uppercase tracking-wider">
              {avatarUri ? "REPLACE PHOTO" : "SELECT PHOTO"}
            </Text>
          </Pressable>
          {avatarUri && (
            <View className="items-center mt-3 shadow-xl">
              <Image source={{ uri: avatarUri }} className="w-20 h-20 rounded-full border-2 border-accent" />
            </View>
          )}
        </View>

        <Pressable
          className={`bg-accent p-5 rounded-xl items-center mt-6 shadow-xl shadow-accent/20 active:scale-[0.98] transition-all ${loading ? "opacity-50" : "opacity-100"}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F1EFE8" />
          ) : (
            <Text className="text-white font-bold font-mono text-sm tracking-widest uppercase">SUBMIT ENROLLMENT</Text>
          )}
        </Pressable>

        {error && <Text className="text-accent font-mono text-xs text-center mt-4 uppercase tracking-tighter bg-accent/5 py-2 rounded">{error}</Text>}

        <View className="items-center mt-8 mb-10">
          <Pressable onPress={() => navigation.navigate("Login")} className="active:opacity-60">
            <Text className="text-muted font-mono text-[11px] font-bold uppercase tracking-widest underline decoration-border underline-offset-4">
              BACK TO LOGIN
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
