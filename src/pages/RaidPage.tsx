import { useCallback, useEffect, useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { Raid } from '../lib/types';
import { Modal } from '../components/Modal';
import { ImagePicker } from '../components/ImagePicker';
import { Page, SectionHeader, Button, Field, inputStyle, Spinner, Empty, SANS, SERIF, KR } from '../components/ui';
import { ModalTitle, FormButtons } from './NoticePage';

const STATE_LABEL: Record<Raid['state'], { text: string; color: string }> = {
  CLEARED: { text: 'CLEARED', color: 'var(--accent)' },
  PROGRESS: { text: 'PROGRESS', color: 'var(--gold)' },
  PLANNED: { text: 'PLANNED', color: 'var(--faint)' },
};

export function RaidPage() {
  const { canWrite, isAdmin, profile } = useAuth();
  const [raids, setRaids] = useState<Raid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('raids').select('*').order('created_at', { ascending: false });
    setRaids((data as Raid[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const cleared = raids.filter((r) => r.state === 'CLEARED').length;
  const progress = raids.filter((r) => r.state === 'PROGRESS').length;
  const pulls = raids.reduce((s, r) => s + (r.pulls || 0), 0);

  async function remove(id: string) {
    if (!confirm('레이드 기록을 삭제할까요?')) return;
    await supabase.from('raids').delete().eq('id', id);
    load();
  }

  return (
    <Page>
      <SectionHeader
        eyebrow="Raid Log"
        title="우리가 넘은 파도들"
        right={canWrite ? <Button onClick={() => setShowForm(true)}>+ 레이드 기록</Button> : undefined}
      />

      <div style={{ display: 'flex', marginTop: 28, border: '1px solid var(--line)', borderRadius: 3, overflow: 'hidden', width: 'fit-content', flexWrap: 'wrap' }}>
        <Stat n={pad2(cleared)} label="CLEARED" color="var(--accent)" />
        <Stat n={pad2(progress)} label="PROGRESS" color="var(--gold)" border />
        <Stat n={String(pulls)} label="PULLS" color="var(--ink)" />
      </div>

      {loading ? <Spinner /> : raids.length === 0 ? (
        <div style={{ marginTop: 32 }}><Empty>아직 레이드 기록이 없어요.</Empty></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 36 }}>
          {raids.map((r) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1.5fr) minmax(0,1.2fr) auto', gap: 20, alignItems: 'center', padding: 16, background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4 }} className="lux-raid-row">
              <div style={{ width: 120, height: 88, background: 'var(--tint)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                {r.cover_url && <img src={r.cover_url} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, color: 'var(--ink2)' }}>{r.name}</div>
                {r.memo && <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>{r.memo}</div>}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: STATE_LABEL[r.state].color }}>
                  <span>{STATE_LABEL[r.state].text}</span><span>{r.progress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--line2)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.progress}%`, background: STATE_LABEL[r.state].color }} />
                </div>
                <div style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)', marginTop: 6 }}>{r.pulls} pulls · {r.party || '—'}</div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--muted)' }}>{r.cleared_on || (r.state === 'PLANNED' ? '예정' : '진행 중')}</div>
                {(isAdmin || r.author_id === profile?.id) && (
                  <button onClick={() => remove(r.id)} style={{ background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', marginTop: 6, fontFamily: SANS }}>삭제</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <RaidForm onClose={() => setShowForm(false)} onDone={load} authorId={profile!.id} />}
      <style>{`@media (max-width: 760px){ .lux-raid-row{ grid-template-columns: 90px 1fr !important; } }`}</style>
    </Page>
  );
}

function RaidForm({ onClose, onDone, authorId }: { onClose: () => void; onDone: () => void; authorId: string }) {
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [state, setState] = useState<Raid['state']>('PROGRESS');
  const [progress, setProgress] = useState(0);
  const [pulls, setPulls] = useState(0);
  const [party, setParty] = useState('8인 고정');
  const [clearedOn, setClearedOn] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const cover = file ? await uploadImage(file, 'raids') : null;
      const { error } = await supabase.from('raids').insert({
        name: name.trim(), memo: memo.trim() || null, state,
        progress: state === 'CLEARED' ? 100 : progress,
        pulls, party: party.trim() || null, cover_url: cover,
        cleared_on: clearedOn.trim() || null, author_id: authorId,
      });
      if (error) throw error;
      onDone(); onClose();
    } catch (err) { alert((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} width={560}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW RAID">레이드 기록 추가</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <ImagePicker onPick={(f) => setFile(f[0])} height={160} label="클리어샷 (선택)" />
          <Field label="레이드 이름"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 극 만신 소피아" /></Field>
          <Field label="메모"><textarea style={{ ...inputStyle, fontFamily: KR, resize: 'vertical' }} rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="상태">
              <select style={{ ...inputStyle, appearance: 'auto' }} value={state} onChange={(e) => setState(e.target.value as Raid['state'])}>
                <option value="PROGRESS">진행 중</option><option value="CLEARED">클리어</option><option value="PLANNED">예정</option>
              </select>
            </Field>
            <Field label="진행도 (%)"><input style={inputStyle} type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} disabled={state === 'CLEARED'} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="트라이 수"><input style={inputStyle} type="number" min={0} value={pulls} onChange={(e) => setPulls(Number(e.target.value))} /></Field>
            <Field label="파티"><input style={inputStyle} value={party} onChange={(e) => setParty(e.target.value)} /></Field>
            <Field label="클리어 날짜"><input style={inputStyle} value={clearedOn} onChange={(e) => setClearedOn(e.target.value)} placeholder="예: 07.11" /></Field>
          </div>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

function Stat({ n, label, color, border }: { n: string; label: string; color: string; border?: boolean }) {
  return (
    <div style={{ padding: '18px 34px', borderLeft: border ? '1px solid var(--line)' : undefined, borderRight: border ? '1px solid var(--line)' : undefined }}>
      <div style={{ fontFamily: SERIF, fontSize: 38, color, lineHeight: 1 }}>{n}</div>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '.28em', color: 'var(--faint)', marginTop: 8 }}>{label}</div>
    </div>
  );
}
const pad2 = (n: number) => String(n).padStart(2, '0');
