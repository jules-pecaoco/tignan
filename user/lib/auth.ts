import { supabase } from "./supabase";
export { supabase };
import { Session } from "@supabase/supabase-js";

export type UserRole = "user" | "rescuer" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  address: string;
  avatar_url?: string;
  created_at: string;
}

export interface RescuerProfile extends Profile {
  org_name: string;
  org_type: string;
  callsign: string;
  id_number: string;
  id_image_url: string;
  gps_lat: number;
  gps_lng: number;
  verified: boolean;
  verified_at?: string;
  verified_by?: string;
  status: string;
}

export async function signUpUser(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  avatar?: File | { uri: string; name: string; type: string } | null;
}): Promise<{ error: string | null }> {
  try {
    // Sign up with metadata — the DB trigger auto-creates the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'user',
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
        },
      },
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user" };

    const uid = authData.user.id;

    // Upload avatar if provided (optional, non-blocking)
    if (data.avatar) {
      const ext = data.avatar.name.split(".").pop();
      const path = `avatars/${uid}.${ext}`;

      let uploadFile;
      if (data.avatar instanceof File) {
        uploadFile = data.avatar;
      } else {
        const res = await fetch(data.avatar.uri);
        uploadFile = await res.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from("tignan-assets")
        .upload(path, uploadFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("tignan-assets")
          .getPublicUrl(path);

        // Update the profile with avatar URL
        await supabase
          .from("profiles")
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq("id", uid);
      }
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Login failed." };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
  if (error || !data) return null;
  return data as Profile;
}
