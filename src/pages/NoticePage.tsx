import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { Notice, ScheduleEvent } from '../lib/types';
import { Modal } from '../components/Modal';
import { Page, SectionHeader, Button, Field, inputStyle, Badge, Spinner, Empty, SANS, SERIF, KR } from '../components/ui';

const TAGS: Record<string, string> = { 필독: 'var(--accent)', 모집: 'var(--gold)', 공지: 'var(--w4)' };
const KINDS: Record<string, string> = { raid: 'var(--accent)', gather: 'var(--gold)', meet: 'var(--w4)' };

export function NoticePage() {
  const { canWrite, isAdmin, profile } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const [showEvent, setShowEvent] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: n }, { data: e }] = await Promise.all([
      supabase.from('notices').select('*, author:profiles(character_name)').order('created_at', { ascending: false }),
      supabase.from('schedule_events').select('*').gte('event_at', new Date(Date.now() - 864e5).toISOString()).order('event_at', { ascending: true }),
    ]);
    setNotices((n as Notice[]) ?? []);
    setEvents((e as ScheduleEvent[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function removeNotice(id: string) {
    if (!confirm('공지를 삭제할까요?')) return;
    await supabase.from('notices').delete().eq('id', id);
    load();
  }
  async function removeEvent(id: string) {
    if (!confirm('일정을 삭제할까요?')) return;
    await supabase.from('schedule_events').delete().eq('id', id);
    load();
  }

  return (
    <Page>
      <SectionHeader
        eyebrow="Notice & Schedule"
        title="공지와 이번 달 일정"
        desc="부대의 소식과 다가오는 일정을 한눈에. 새 소식은 글쓰기 권한이 있는 부대원이 올릴 수 있어요."
        right={canWrite ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={() => setShowNotice(true)}>+ 공지</Button>
            <Button onClick={() => setShowEvent(true)}>+ 일정</Button>
          </div>
        ) : undefined}
      />

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 28, marginTop: 36 }} className="lux-notice-grid">
          {/* Notices */}
          <div>
            <ColTitle>공지</ColTitle>
            {notices.length === 0 ? <Empty>아직 공지가 없어요.</Empty> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 3 }}>
                    <div style={{ paddingTop: 2 }}><Badge color={TAGS[n.tag] || 'var(--w4)'}>{n.tag}</Badge></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: 'var(--ink2)' }}>{n.title}</div>
                      {n.body && <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.75 }}>{n.body}</div>}
                      <div style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)', marginTop: 8 }}>
                        {fmt(n.created_at)} · {n.author?.character_name || ''}
                        {(isAdmin || n.author_id === profile?.id) && (
                          <button onClick={() => removeNotice(n.id)} style={delBtn}>삭제</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <ColTitle>다가오는 일정</ColTitle>
            {events.length === 0 ? <Empty>예정된 일정이 없어요.</Empty> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {events.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 3 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: KINDS[s.kind] || 'var(--accent)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: 'var(--ink2)' }}>{s.title}</div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                        {fmtDateTime(s.event_at)}{s.note ? ` · ${s.note}` : ''}
                      </div>
                    </div>
                    {(isAdmin || s.author_id === profile?.id) && (
                      <button onClick={() => removeEvent(s.id)} style={{ ...delBtn, marginLeft: 0 }}>삭제</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showNotice && <NoticeForm onClose={() => setShowNotice(false)} onDone={load} authorId={profile!.id} />}
      {showEvent && <EventForm onClose={() => setShowEvent(false)} onDone={load} authorId={profile!.id} />}

      <style>{`@media (max-width: 820px){ .lux-notice-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </Page>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ fontFamily: SERIF, fontSize: 24, color: 'var(--ink)' }}>{children}</div>
      <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
    </div>
  );
}

function NoticeForm({ onClose, onDone, authorId }: { onClose: () => void; onDone: () => void; authorId: string }) {
  const [tag, setTag] = useState('공지');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('notices').insert({ tag, title: title.trim(), body: body.trim() || null, author_id: authorId });
    setBusy(false);
    if (error) return alert(error.message);
    onDone(); onClose();
  }
  return (
    <Modal open onClose={onClose} width={520}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW NOTICE">공지 작성</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="분류">
            <select style={{ ...inputStyle, appearance: 'auto' }} value={tag} onChange={(e) => setTag(e.target.value)}>
              {Object.keys(TAGS).map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="제목"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} /></Field>
          <Field label="내용"><textarea style={{ ...inputStyle, fontFamily: KR, resize: 'vertical' }} rows={4} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

function EventForm({ onClose, onDone, authorId }: { onClose: () => void; onDone: () => void; authorId: string }) {
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  const [kind, setKind] = useState('raid');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !when) return;
    setBusy(true);
    const { error } = await supabase.from('schedule_events').insert({ title: title.trim(), event_at: new Date(when).toISOString(), note: note.trim() || null, kind, author_id: authorId });
    setBusy(false);
    if (error) return alert(error.message);
    onDone(); onClose();
  }
  return (
    <Modal open onClose={onClose} width={520}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW SCHEDULE">일정 추가</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="제목"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 정기 극만신" /></Field>
          <Field label="일시"><input style={inputStyle} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="종류">
              <select style={{ ...inputStyle, appearance: 'auto' }} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="raid">레이드</option><option value="gather">채집·원정</option><option value="meet">모임</option>
              </select>
            </Field>
            <Field label="메모"><input style={inputStyle} value={note} onChange={(e) => setNote(e.target.value)} placeholder="예: 3자리 남음" /></Field>
          </div>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function ModalTitle({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 11, letterSpacing: '.4em', color: 'var(--accent)', textTransform: 'uppercase' }}>{eyebrow}</div>
      <div style={{ fontFamily: SERIF, fontSize: 32, color: 'var(--ink)', marginTop: 6 }}>{children}</div>
    </div>
  );
}
export function FormButtons({ busy, onClose }: { busy: boolean; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
      <Button variant="ghost" onClick={onClose}>취소</Button>
      <Button type="submit" disabled={busy}>{busy ? '저장 중…' : '저장'}</Button>
    </div>
  );
}

const delBtn: React.CSSProperties = { marginLeft: 10, background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', fontFamily: SANS };
const fmt = (iso: string) => { const d = new Date(iso); return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
const fmtDateTime = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
