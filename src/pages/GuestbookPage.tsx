import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { GuestbookEntry } from '../lib/types';
import { Page, SectionHeader, Button, inputStyle, Spinner, Empty, SANS, KR } from '../components/ui';

const CARD_BG = ['#fff', 'var(--paper2)'];

export function GuestbookPage() {
  const { profile, isAdmin } = useAuth();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(profile?.character_name || '');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('guestbook').select('*').order('created_at', { ascending: false });
    setEntries((data as GuestbookEntry[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('guestbook').insert({
      author_name: (name.trim() || profile?.character_name || '익명'),
      body: body.trim(),
      author_id: profile?.id ?? null,
    });
    setBusy(false);
    if (error) return alert(error.message);
    setBody('');
    load();
  }

  async function remove(id: string) {
    if (!confirm('삭제할까요?')) return;
    await supabase.from('guestbook').delete().eq('id', id);
    load();
  }

  return (
    <Page>
      <SectionHeader eyebrow="Guestbook" title="남기고 가는 말" desc="오늘 이 사이트에 남기고 싶은 말을 적어주세요." />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)', gap: 28, marginTop: 36, alignItems: 'start' }} className="lux-guest-grid">
        {/* Form */}
        <form onSubmit={submit} style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4, padding: 22, position: 'sticky', top: 94 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: 'var(--ink2)', marginBottom: 14 }}>한 줄 남기기</div>
          <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
          <textarea style={{ ...inputStyle, fontFamily: KR, resize: 'vertical', marginBottom: 12 }} rows={5} placeholder="오늘 이 사이트에 남기고 싶은 말" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} />
          <Button type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? '남기는 중…' : '남기기'}</Button>
        </form>

        {/* Entries */}
        <div>
          {loading ? <Spinner /> : entries.length === 0 ? (
            <Empty>아직 남겨진 말이 없어요. 첫 번째로 남겨보세요.</Empty>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {entries.map((g, i) => (
                <div key={g.id} style={{ background: CARD_BG[i % 2], border: '1px solid var(--line)', borderRadius: 4, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8, flex: 1 }}>{g.body}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontFamily: SANS, fontSize: 11.5, color: 'var(--faint)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--muted)' }}>{g.author_name}</span>
                    <span>{fmt(g.created_at)}</span>
                  </div>
                  {(isAdmin || g.author_id === profile?.id) && (
                    <button onClick={() => remove(g.id)} style={{ background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', marginTop: 8, alignSelf: 'flex-end', fontFamily: SANS }}>삭제</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 760px){ .lux-guest-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </Page>
  );
}

const fmt = (iso: string) => { const d = new Date(iso); return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
