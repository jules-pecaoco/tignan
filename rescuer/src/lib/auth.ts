import { supabase } from './supabase.ts';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'rescuer' | 'admin';
export type OrgType = 'government' | 'ngo' | 'volunteer' | 'private';

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
  org_type: OrgType;
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

export async function signUpRescuer(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  org_name: string;
  org_type: OrgType;
  id_number: string;
  callsign: string;
  gps_lat: number;
  gps_lng: number;
  id_image: File | { uri: string; name: string; type: string };
}): Promise<{ error: string | null }> {
  try {
    // Sign up with metadata — the DB trigger auto-creates profiles + rescuer_profiles
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'rescuer',
          full_name: data.full_name,
          phone: data.phone,
          address: data.address,
          org_name: data.org_name,
          org_type: data.org_type,
          id_number: data.id_number,
          gps_lat: data.gps_lat,
          gps_lng: data.gps_lng,
        },
      },
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "Failed to create rescuer account." };

    const uid = authData.user.id;

    // Upload ID Image (user has a JWT from signUp even before email confirmation)
    const idExt = data.id_image.name.split('.').pop();
    const idPath = `rescuer-ids/${uid}.${idExt}`;
    let uploadIdFile;
    if (data.id_image instanceof File) {
      uploadIdFile = data.id_image;
    } else {
      const res = await fetch(data.id_image.uri);
      uploadIdFile = await res.blob();
    }
    const { error: idUploadError } = await supabase.storage
      .from('tignan-assets')
      .upload(idPath, uploadIdFile, { upsert: true });

    if (idUploadError) {
      console.error('ID upload error:', idUploadError);
      // Non-fatal: profile was already created by trigger, update the image URL later
    }

    // Update rescuer_profile with image path and callsign
    const { error: updateError } = await supabase
      .from('rescuer_profiles')
      .update({
        id_image_url: idPath,
        callsign: data.callsign,
      })
      .eq('id', uid);

    if (updateError) {
      console.error('Rescuer profile update error:', updateError);
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
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error || !data) return null;
  return data as Profile;
}
