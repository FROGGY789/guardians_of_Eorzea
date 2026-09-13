import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The LUX Free Company Supabase project. These are the PUBLIC (anon) client
// credentials — they are designed to be shipped in the browser bundle; all real
// security is enforced by Postgres Row Level Security (see supabase/schema.sql).
// Override them with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY if you fork.
const DEFAULT_URL = 'https://bcrckcusoqxgucbtjcwo.supabase.co';
const DEFAULT_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcmNrY3Vzb3F4Z3VjYnRqY3dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzQyMTEsImV4cCI6MjEwNDg1MDIxMX0.h-dJc0Z8_NrW5Dtj5oHDwA4Kn4KSNRliVj1Dyyvw_H8';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_ANON;

// True once real credentials are present (they are, by default).
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR-PROJECT') && !anonKey.includes('your-anon'),
);

export const supabase: SupabaseClient = createClient(url, anonKey);

// FFXIV members log in with a character nickname, not an email — but Supabase Auth
// requires an email. We derive a stable, unique pseudo-email from the nickname so
// the same nickname always maps to the same account (case-insensitive).
export async function nicknameToEmail(nickname: string): Promise<string> {
  const norm = nickname.trim().toLowerCase();
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `lux_${hex.slice(0, 40)}@luxfc.app`;
}

export const GALLERY_BUCKET = 'gallery';

// Upload a File to the gallery storage bucket and return its public URL.
export async function uploadImage(file: File, folder = 'uploads'): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(GALLERY_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
