import { supabase } from './supabase.ts';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'rescuer' | 'admin';

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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create user" };

    const uid = authData.user.id;
    let avatarUrl = null;

    if (data.avatar) {
      const ext = data.avatar.name.split('.').pop();
      const path = `avatars/${uid}.${ext}`;
      
      let uploadFile;
      if (data.avatar instanceof File) {
        uploadFile = data.avatar;
      } else {
        // React Native mapping
        const res = await fetch(data.avatar.uri);
        uploadFile = await res.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('tignan-assets')
        .upload(path, uploadFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
            .from('tignan-assets')
            .getPublicUrl(path);
        avatarUrl = publicUrlData.publicUrl;
      }
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: uid,
      role: 'user',
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      avatar_url: avatarUrl
    });

    if (profileError) return { error: profileError.message };

    return { error: null };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function signUpRescuer(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  id_number: string;
  gps_lat: number;
  gps_lng: number;
  avatar?: File | { uri: string; name: string; type: string } | null;
  id_image: File | { uri: string; name: string; type: string };
}): Promise<{ error: string | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create rescuer" };

    const uid = authData.user.id;
    let avatarUrl = null;
    let idImageUrl = '';

    // Upload Avatar
    if (data.avatar) {
      const ext = data.avatar.name.split('.').pop();
      const path = `avatars/${uid}.${ext}`;
      let uploadFile;
      if (data.avatar instanceof File) {
        uploadFile = data.avatar;
      } else {
        const res = await fetch(data.avatar.uri);
        uploadFile = await res.blob();
      }
      const { error: uploadError } = await supabase.storage.from('tignan-assets').upload(path, uploadFile, { upsert: true });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('tignan-assets').getPublicUrl(path);
        avatarUrl = publicUrlData.publicUrl;
      }
    }

    // Upload ID Image
    const idExt = data.id_image.name.split('.').pop();
    const idPath = `rescuer-ids/${uid}.${idExt}`;
    let uploadIdFile;
    if (data.id_image instanceof File) {
      uploadIdFile = data.id_image;
    } else {
      const res = await fetch(data.id_image.uri);
      uploadIdFile = await res.blob();
    }
    const { error: idUploadError } = await supabase.storage.from('tignan-assets').upload(idPath, uploadIdFile, { upsert: true });
    
    if (idUploadError) return { error: "Failed to upload ID." };
    idImageUrl = idPath; // Store relative path, map to public inside admin.

    const { error: profileError } = await supabase.from('profiles').insert({
      id: uid,
      role: 'rescuer',
      full_name: data.full_name,
      phone: data.phone,
      address: data.address,
      avatar_url: avatarUrl
    });

    if (profileError) return { error: profileError.message };

    const { error: rescuerError } = await supabase.from('rescuer_profiles').insert({
      id: uid,
      id_number: data.id_number,
      id_image_url: idImageUrl,
      gps_lat: data.gps_lat,
      gps_lng: data.gps_lng,
      verified: false
    });

    if (rescuerError) return { error: rescuerError.message };

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
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error || !data) return null;
  return data as Profile;
}
