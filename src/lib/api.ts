import { supabase } from './supabase';
import type { GalleryPost } from './types';

/**
 * The most recent gallery post that has a cover image. Used for the login
 * "대문" polaroid and the gallery home hero — both always show the latest photo.
 */
export async function getLatestPost(): Promise<GalleryPost | null> {
  const { data, error } = await supabase
    .from('gallery_posts')
    .select('*, author:profiles(character_name)')
    .not('cover_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('최근 사진 조회 실패:', error.message);
    return null;
  }
  return (data as GalleryPost) ?? null;
}

export interface FcStats {
  members: number;
  polaroids: number;
  raidsCleared: number;
}

/** Headline counts for the gallery home. */
export async function getStats(): Promise<FcStats> {
  const [members, photos, raids] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('role', 'pending'),
    supabase.from('gallery_photos').select('id', { count: 'exact', head: true }),
    supabase.from('raids').select('id', { count: 'exact', head: true }).eq('state', 'CLEARED'),
  ]);
  return {
    members: members.count ?? 0,
    polaroids: photos.count ?? 0,
    raidsCleared: raids.count ?? 0,
  };
}
