import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, GalleryPost } from '../lib/types';
import { Modal } from '../components/Modal';
import { Polaroid } from '../components/Polaroid';
import { GalleryPostModal } from '../components/GalleryPostModal';
import { Page, SectionHeader, Spinner, Badge, Empty, SANS, SERIF, KR } from '../components/ui';

export function RosterPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('role', 'pending')
      .order('joined_at', { ascending: true });
    setMembers((data as Profile[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Page>
      <SectionHeader
        eyebrow={`Roster · ${members.length}`}
        title="부대원 명부"
        desc="이름을 누르면 그 사람이 남긴 폴라로이드만 모아서 볼 수 있어요."
      />

      {loading ? <Spinner /> : members.length === 0 ? (
        <div style={{ marginTop: 32 }}><Empty>아직 부대원이 없어요.</Empty></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 36 }}>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              style={{
                textAlign: 'left',
                background: 'var(--paper2)',
                border: '1px solid var(--line)',
                borderRadius: 4,
                padding: '20px 20px 18px',
                cursor: 'pointer',
                transition: 'transform .12s ease, box-shadow .12s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 30px -18px rgba(6,40,50,.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: m.avatar_url ? `url(${m.avatar_url}) center/cover` : 'linear-gradient(150deg, var(--w2), var(--accent))', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: SERIF, fontSize: 22 }}>
                  {!m.avatar_url && m.character_name.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, color: 'var(--ink2)' }}>{m.character_name}</span>
                    {m.role === 'admin' && <Badge color="var(--gold)">부대장</Badge>}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {m.job || '직업 미설정'} · {m.rank || '대원'}
                  </div>
                </div>
              </div>
              {m.bio && <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 14, lineHeight: 1.7 }}>{m.bio}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: SANS, fontSize: 11, color: 'var(--faint)', letterSpacing: '.04em' }}>
                <span>가입 {fmtMonth(m.joined_at)}</span>
                <span>{m.photos_count}장</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <MemberPhotos member={selected} onClose={() => setSelected(null)} onOpenPost={(id) => setOpenPostId(id)} />
      )}
      <GalleryPostModal postId={openPostId} onClose={() => setOpenPostId(null)} onChanged={load} />
    </Page>
  );
}

function MemberPhotos({ member, onClose, onOpenPost }: { member: Profile; onClose: () => void; onOpenPost: (id: string) => void }) {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('gallery_posts').select('*').eq('author_id', member.id).order('created_at', { ascending: false }).then(({ data }) => {
      setPosts((data as GalleryPost[]) ?? []);
      setLoading(false);
    });
  }, [member.id]);

  return (
    <Modal open onClose={onClose} width={720}>
      <div style={{ padding: '32px 32px 34px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: member.avatar_url ? `url(${member.avatar_url}) center/cover` : 'linear-gradient(150deg, var(--w2), var(--accent))', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: SERIF, fontSize: 24 }}>
            {!member.avatar_url && member.character_name.charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: 'var(--ink)' }}>{member.character_name}</div>
            <div style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--muted)' }}>{member.job || '직업 미설정'} · {member.role === 'admin' ? '부대장' : member.rank || '대원'}</div>
          </div>
        </div>

        <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.2em', color: 'var(--faint)', textTransform: 'uppercase', margin: '26px 0 16px' }}>
          {member.character_name}님의 폴라로이드
        </div>

        {loading ? <Spinner /> : posts.length === 0 ? (
          <Empty>아직 남긴 폴라로이드가 없어요.</Empty>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 20 }}>
            {posts.map((p, i) => (
              <Polaroid
                key={p.id}
                src={p.cover_url}
                title={p.title}
                subtitle={fmtShort(p.created_at)}
                rotate={[-2, 1.5, -1, 1.8][i % 4]}
                onClick={() => { onClose(); onOpenPost(p.id); }}
                placeholder={p.title}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

const fmtMonth = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`; };
const fmtShort = (iso: string) => { const d = new Date(iso); return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
