import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { getLatestPost, getStats, type FcStats } from '../lib/api';
import type { GalleryPost } from '../lib/types';
import { Polaroid } from '../components/Polaroid';
import { NewPostModal } from '../components/NewPostModal';
import { GalleryPostModal } from '../components/GalleryPostModal';
import { Spinner, SANS, SERIF, KR } from '../components/ui';

const FILTERS = ['전체', '레이드', '하우징', '일상'] as const;
const ROTATIONS = [-2, 1.4, -1, 2, 1, -1.8, 1.6, -1.2];

export function GalleryPage({ onOpenTab: _onOpenTab }: { onOpenTab: (i: number) => void }) {
  const { canWrite } = useAuth();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [latest, setLatest] = useState<GalleryPost | null>(null);
  const [stats, setStats] = useState<FcStats>({ members: 0, polaroids: 0, raidsCleared: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('전체');
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_posts')
      .select('*, author:profiles(character_name)')
      .order('created_at', { ascending: false });
    setPosts((data as GalleryPost[]) ?? []);
    const [l, s] = await Promise.all([getLatestPost(), getStats()]);
    setLatest(l);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const shown = filter === '전체' ? posts : posts.filter((p) => p.category === filter);

  return (
    <div>
      {/* ===== Home hero ===== */}
      <section
        style={{
          padding: 'clamp(48px, 7vw, 78px) clamp(20px, 5vw, 48px) 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--paper2) 0%, var(--paper) 100%)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11, letterSpacing: '.5em', color: 'var(--accent)', textTransform: 'uppercase' }}>
          {latest ? formatEyebrow(latest.created_at) : formatEyebrow(new Date().toISOString())}
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(38px, 6vw, 64px)', color: 'var(--ink)', lineHeight: 1.12, marginTop: 16, fontWeight: 400 }}>
          물이 유리처럼 맑던 날,
          <br />
          <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>우리의 기록을 남긴다.</span>
        </h1>
        <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 15, color: 'var(--muted)', marginTop: 20, lineHeight: 2, maxWidth: 560 }}>
          사진 한 장, 문장 한 줄이면 충분해요.
          <br />이 기록은 우리가 함께 있었다는 증거니까. — <i>부대장 씀</i>
        </p>

        {/* Hero polaroid = latest gallery photo */}
        <div style={{ marginTop: 44, width: 'min(440px, 92vw)' }}>
          <Polaroid
            size="lg"
            src={latest?.cover_url}
            title={latest?.title || 'our clearest summer'}
            subtitle={latest ? heroSub(latest) : '첫 사진을 기다리는 중'}
            onClick={latest ? () => setOpenId(latest.id) : undefined}
            placeholder="첫 갤러리 사진이 올라오면 여기에 표시됩니다"
          />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', marginTop: 52, border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Stat n={pad2(stats.members)} label="MEMBERS" color="var(--ink)" />
          <Stat n={String(stats.polaroids)} label="POLAROIDS" color="var(--accent)" border />
          <Stat n={pad2(stats.raidsCleared)} label="RAIDS CLEARED" color="var(--gold)" />
        </div>
      </section>

      {/* ===== Polaroid grid ===== */}
      <section style={{ padding: '56px clamp(20px, 5vw, 48px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 30, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: SERIF, fontSize: 30, color: 'var(--ink)' }}>부대의 폴라로이드</div>
          <div style={{ height: 1, flex: 1, minWidth: 40, background: 'var(--line)' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--line)'}`,
                  color: filter === f ? 'var(--accent)' : 'var(--muted)',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: filter === f ? 600 : 400,
                  borderRadius: 2,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '34px 24px' }}>
            {shown.map((p, i) => (
              <Polaroid
                key={p.id}
                src={p.cover_url}
                title={p.title}
                subtitle={`${formatShort(p.created_at)} · ${p.author?.character_name || ''}`}
                rotate={ROTATIONS[i % ROTATIONS.length]}
                onClick={() => setOpenId(p.id)}
                placeholder={p.title}
              />
            ))}

            {canWrite && (
              <button
                onClick={() => setShowNew(true)}
                style={{
                  border: '1.5px dashed var(--accent)',
                  background: 'var(--paper2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '3 / 3.7',
                  cursor: 'pointer',
                  borderRadius: 2,
                }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 52, color: 'var(--accent)', lineHeight: 1 }}>+</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 12, color: 'var(--accent)', marginTop: 8, letterSpacing: '.16em' }}>
                  사진 붙이기
                </div>
              </button>
            )}

            {shown.length === 0 && !canWrite && (
              <div style={{ gridColumn: '1 / -1', fontFamily: KR, fontWeight: 300, color: 'var(--faint)', textAlign: 'center', padding: '60px 20px' }}>
                아직 올라온 폴라로이드가 없어요.
              </div>
            )}
          </div>
        )}
      </section>

      <NewPostModal open={showNew} onClose={() => setShowNew(false)} onCreated={load} />
      <GalleryPostModal postId={openId} onClose={() => setOpenId(null)} onChanged={load} />
    </div>
  );
}

function Stat({ n, label, color, border }: { n: string; label: string; color: string; border?: boolean }) {
  return (
    <div style={{ padding: '22px clamp(24px, 5vw, 42px)', borderLeft: border ? '1px solid var(--line)' : undefined, borderRight: border ? '1px solid var(--line)' : undefined }}>
      <div style={{ fontFamily: SERIF, fontSize: 42, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '.32em', color: 'var(--faint)', marginTop: 8 }}>{label}</div>
    </div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function formatEyebrow(iso: string): string {
  const d = new Date(iso);
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function formatShort(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
function heroSub(p: GalleryPost): string {
  return [p.location, p.author?.character_name].filter(Boolean).join(' · ') || formatShort(p.created_at);
}
