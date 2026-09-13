// Domain types mirroring the Supabase schema (see supabase/schema.sql).

export type MemberRole = 'admin' | 'member' | 'pending';

export interface Profile {
  id: string;
  character_name: string;
  job: string | null;
  rank: string | null;
  role: MemberRole;
  can_write: boolean;
  bio: string | null;
  avatar_url: string | null;
  photos_count: number;
  joined_at: string;
  created_at: string;
}

export interface GalleryPost {
  id: string;
  title: string;
  caption: string | null;
  location: string | null;
  category: string; // 레이드 | 하우징 | 일상 | 기타
  cover_url: string | null;
  author_id: string | null;
  created_at: string;
  // joined
  author?: Pick<Profile, 'character_name'> | null;
  photos?: GalleryPhoto[];
}

export interface GalleryPhoto {
  id: string;
  post_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Notice {
  id: string;
  tag: string; // 필독 | 모집 | 공지
  title: string;
  body: string | null;
  author_id: string | null;
  created_at: string;
  author?: Pick<Profile, 'character_name'> | null;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  event_at: string;
  note: string | null;
  kind: string; // raid | gather | meet
  author_id: string | null;
  created_at: string;
}

export interface Raid {
  id: string;
  name: string;
  memo: string | null;
  state: 'CLEARED' | 'PROGRESS' | 'PLANNED';
  progress: number;
  pulls: number;
  party: string | null;
  cover_url: string | null;
  cleared_on: string | null;
  author_id: string | null;
  created_at: string;
}

export interface HousingRoom {
  id: string;
  name: string;
  description: string | null;
  decorated_by: string | null;
  image_url: string | null;
  featured: boolean;
  author_id: string | null;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  caption: string | null;
  author_id: string | null;
  created_at: string;
  author?: Pick<Profile, 'character_name'> | null;
}

export interface LinkItem {
  id: string;
  group_name: string;
  name: string;
  description: string | null;
  url: string;
  author_id: string | null;
  created_at: string;
}

export interface GuestbookEntry {
  id: string;
  author_name: string;
  body: string;
  author_id: string | null;
  created_at: string;
}
