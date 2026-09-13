import { useCallback, useEffect, useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { HousingRoom } from '../lib/types';
import { Modal } from '../components/Modal';
import { ImagePicker } from '../components/ImagePicker';
import { Page, SectionHeader, Button, Field, inputStyle, Spinner, Empty, SANS, SERIF, KR } from '../components/ui';
import { ModalTitle, FormButtons } from './NoticePage';

export function HousingPage() {
  const { canWrite, isAdmin, profile } = useAuth();
  const [rooms, setRooms] = useState<HousingRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('housing_rooms').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false });
    setRooms((data as HousingRoom[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm('삭제할까요?')) return;
    await supabase.from('housing_rooms').delete().eq('id', id);
    load();
  }

  const featured = rooms.find((r) => r.featured) || rooms[0];
  const rest = rooms.filter((r) => r.id !== featured?.id);

  return (
    <Page>
      <SectionHeader
        eyebrow="Housing"
        title="우리가 사는 집"
        desc="부대 하우스와 부대원 개인실을 모아둔 방입니다."
        right={canWrite ? <Button onClick={() => setShowForm(true)}>+ 공간 추가</Button> : undefined}
      />

      {loading ? <Spinner /> : rooms.length === 0 ? (
        <div style={{ marginTop: 32 }}><Empty>아직 등록된 공간이 없어요.</Empty></div>
      ) : (
        <div style={{ marginTop: 36 }}>
          {featured && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 24, alignItems: 'stretch', marginBottom: 24 }} className="lux-house-hero">
              <div style={{ aspectRatio: '16/10', background: 'var(--tint)', borderRadius: 4, overflow: 'hidden' }}>
                {featured.image_url && <img src={featured.image_url} alt={featured.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: 32, color: 'var(--ink)' }}>{featured.name}</div>
                {featured.decorated_by && <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--faint)', marginTop: 6, letterSpacing: '.08em' }}>{featured.decorated_by}</div>}
                {featured.description && <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 15, color: 'var(--muted)', lineHeight: 1.9, marginTop: 16 }}>{featured.description}</p>}
                {(isAdmin || featured.author_id === profile?.id) && <button onClick={() => remove(featured.id)} style={delLink}>삭제</button>}
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {rest.map((r) => (
              <div key={r.id} style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '4/3', background: 'var(--tint)' }}>
                  {r.image_url && <img src={r.image_url} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: 'var(--ink2)' }}>{r.name}</div>
                  {r.decorated_by && <div style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--faint)', marginTop: 3 }}>{r.decorated_by}</div>}
                  {r.description && <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>{r.description}</div>}
                  {(isAdmin || r.author_id === profile?.id) && <button onClick={() => remove(r.id)} style={delLink}>삭제</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && <RoomForm onClose={() => setShowForm(false)} onDone={load} authorId={profile!.id} />}
      <style>{`@media (max-width: 760px){ .lux-house-hero{ grid-template-columns: 1fr !important; } }`}</style>
    </Page>
  );
}

function RoomForm({ onClose, onDone, authorId }: { onClose: () => void; onDone: () => void; authorId: string }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [decoratedBy, setDecoratedBy] = useState('');
  const [featured, setFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const img = file ? await uploadImage(file, 'housing') : null;
      const { error } = await supabase.from('housing_rooms').insert({ name: name.trim(), description: description.trim() || null, decorated_by: decoratedBy.trim() || null, image_url: img, featured, author_id: authorId });
      if (error) throw error;
      onDone(); onClose();
    } catch (err) { alert((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} width={540}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW SPACE">공간 추가</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <ImagePicker onPick={(f) => setFile(f[0])} height={180} label="공간 사진" />
          <Field label="이름"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 1층 거실" /></Field>
          <Field label="꾸민 사람 / 위치 (선택)"><input style={inputStyle} value={decoratedBy} onChange={(e) => setDecoratedBy(e.target.value)} placeholder="예: 루아 꾸밈 · 미스트 12-3" /></Field>
          <Field label="설명"><textarea style={{ ...inputStyle, fontFamily: KR, resize: 'vertical' }} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: 13, color: 'var(--muted)', cursor: 'pointer' }}>
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> 대표 공간으로 표시
          </label>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

const delLink: React.CSSProperties = { background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', marginTop: 12, fontFamily: SANS, alignSelf: 'flex-start', padding: 0 };
