import { useCallback, useEffect, useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { DiaryEntry } from '../lib/types';
import { Modal } from '../components/Modal';
import { ImagePicker } from '../components/ImagePicker';
import { Page, SectionHeader, Button, Field, inputStyle, Spinner, Empty, SANS, SERIF, KR } from '../components/ui';
import { ModalTitle, FormButtons } from './NoticePage';

export function DiaryPage() {
  const { canWrite, isAdmin, profile } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('diary_entries').select('*, author:profiles(character_name)').order('created_at', { ascending: false });
    setEntries((data as DiaryEntry[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm('일지를 삭제할까요?')) return;
    await supabase.from('diary_entries').delete().eq('id', id);
    load();
  }

  return (
    <Page>
      <SectionHeader
        eyebrow="Journal"
        title="부대 일지"
        desc="오늘 쓴 한 줄이 내년의 우리를 웃게 합니다."
        right={canWrite ? <Button onClick={() => setShowForm(true)}>일지 쓰기</Button> : undefined}
      />

      {loading ? <Spinner /> : entries.length === 0 ? (
        <div style={{ marginTop: 32 }}><Empty>아직 작성된 일지가 없어요.</Empty></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 40, maxWidth: 780 }}>
          {entries.map((d, i) => (
            <article key={d.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontSize: 11, letterSpacing: '.2em', color: 'var(--faint)', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmtLong(d.created_at)}</span>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--line)' }} />
                <span>{d.author?.character_name || ''}</span>
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: 32, color: 'var(--ink)', marginTop: 12, fontWeight: 400 }}>{d.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: d.image_url ? 'minmax(0,1.6fr) minmax(0,1fr)' : '1fr', gap: 26, marginTop: 18, alignItems: 'start' }} className="lux-diary-row">
                {d.body && <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 15.5, color: 'var(--ink2)', lineHeight: 2.05, whiteSpace: 'pre-wrap' }}>{d.body}</p>}
                {d.image_url && (
                  <div style={{ background: '#fff', padding: '10px 10px 14px', boxShadow: '0 18px 34px -20px rgba(15,43,51,.3)', transform: `rotate(${[-2, 1.6, -1.2][i % 3]}deg)` }}>
                    <img src={d.image_url} alt={d.caption || d.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', background: 'var(--tint)' }} />
                    {d.caption && <div style={{ fontFamily: KR, textAlign: 'center', fontSize: 12.5, color: '#20313a', marginTop: 8 }}>{d.caption}</div>}
                  </div>
                )}
              </div>
              {(isAdmin || d.author_id === profile?.id) && (
                <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', marginTop: 16, fontFamily: SANS }}>삭제</button>
              )}
            </article>
          ))}
        </div>
      )}

      {showForm && <DiaryForm onClose={() => setShowForm(false)} onDone={load} authorId={profile!.id} />}
      <style>{`@media (max-width: 700px){ .lux-diary-row{ grid-template-columns: 1fr !important; } }`}</style>
    </Page>
  );
}

function DiaryForm({ onClose, onDone, authorId }: { onClose: () => void; onDone: () => void; authorId: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const img = file ? await uploadImage(file, 'diary') : null;
      const { error } = await supabase.from('diary_entries').insert({ title: title.trim(), body: body.trim() || null, image_url: img, caption: caption.trim() || null, author_id: authorId });
      if (error) throw error;
      onDone(); onClose();
    } catch (err) { alert((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <Modal open onClose={onClose} width={600}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW JOURNAL">일지 쓰기</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="제목"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 물이 유리처럼 맑던 날" /></Field>
          <Field label="본문"><textarea style={{ ...inputStyle, fontFamily: KR, resize: 'vertical', lineHeight: 1.8 }} rows={7} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
          <ImagePicker onPick={(f) => setFile(f[0])} height={160} label="그날의 사진 (선택)" />
          <Field label="사진 캡션 (선택)"><input style={inputStyle} value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

function fmtLong(iso: string): string {
  const d = new Date(iso);
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}
