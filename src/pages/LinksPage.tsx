import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { LinkItem } from '../lib/types';
import { Modal } from '../components/Modal';
import { Page, SectionHeader, Button, Field, inputStyle, Spinner, Empty, SANS, SERIF, KR } from '../components/ui';
import { ModalTitle, FormButtons } from './NoticePage';

export function LinksPage() {
  const { canWrite, isAdmin, profile } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('links').select('*').order('group_name', { ascending: true }).order('created_at', { ascending: true });
    setLinks((data as LinkItem[]) ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function remove(id: string) {
    if (!confirm('링크를 삭제할까요?')) return;
    await supabase.from('links').delete().eq('id', id);
    load();
  }

  const groups = links.reduce<Record<string, LinkItem[]>>((acc, l) => {
    (acc[l.group_name] ||= []).push(l);
    return acc;
  }, {});

  return (
    <Page>
      <SectionHeader
        eyebrow="Ports of Call"
        title="파판 정보 사이트 모음"
        desc="자주 쓰는 사이트를 분류해 뒀어요. 새 링크는 글쓰기 권한이 있는 부대원이 추가할 수 있습니다."
        right={canWrite ? <Button onClick={() => setShowForm(true)}>+ 링크 추가</Button> : undefined}
      />

      {loading ? <Spinner /> : links.length === 0 ? (
        <div style={{ marginTop: 32 }}><Empty>아직 등록된 링크가 없어요.</Empty></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40, marginTop: 40 }}>
          {Object.entries(groups).map(([name, items]) => (
            <div key={name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ fontFamily: SERIF, fontSize: 24, color: 'var(--ink)' }}>{name}</div>
                <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
                <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--faint)' }}>{items.length}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {items.map((l) => (
                  <div key={l.id} style={{ position: 'relative', border: '1px solid var(--line)', borderRadius: 4, background: 'var(--paper2)' }}>
                    <a href={withProtocol(l.url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '18px 18px 16px', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: 'var(--ink2)' }}>{l.name}</span>
                        <span style={{ color: 'var(--accent)', fontSize: 16 }}>→</span>
                      </div>
                      {l.description && <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>{l.description}</div>}
                      <div style={{ fontFamily: SANS, fontSize: 11.5, color: 'var(--faint)', marginTop: 10, letterSpacing: '.04em' }}>{l.url}</div>
                    </a>
                    {(isAdmin || l.author_id === profile?.id) && (
                      <button onClick={() => remove(l.id)} style={{ position: 'absolute', bottom: 10, right: 12, background: 'none', border: 'none', color: '#b3402b', fontSize: 11, cursor: 'pointer', fontFamily: SANS }}>삭제</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <LinkForm onClose={() => setShowForm(false)} onDone={load} authorId={profile!.id} existingGroups={Object.keys(groups)} />}
    </Page>
  );
}

function LinkForm({ onClose, onDone, authorId, existingGroups }: { onClose: () => void; onDone: () => void; authorId: string; existingGroups: string[] }) {
  const [group, setGroup] = useState(existingGroups[0] || '공략 · 로그');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setBusy(true);
    const { error } = await supabase.from('links').insert({ group_name: group.trim() || '기타', name: name.trim(), url: url.trim(), description: description.trim() || null, author_id: authorId });
    setBusy(false);
    if (error) return alert(error.message);
    onDone(); onClose();
  }
  return (
    <Modal open onClose={onClose} width={520}>
      <form onSubmit={submit} style={{ padding: 30 }}>
        <ModalTitle eyebrow="NEW LINK">링크 추가</ModalTitle>
        <div style={{ display: 'grid', gap: 16 }}>
          <Field label="분류 (그룹)"><input style={inputStyle} value={group} onChange={(e) => setGroup(e.target.value)} placeholder="예: 공략 · 로그" list="lux-groups" />
            <datalist id="lux-groups">{existingGroups.map((g) => <option key={g} value={g} />)}</datalist>
          </Field>
          <Field label="사이트 이름"><input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: FF Logs" /></Field>
          <Field label="주소"><input style={inputStyle} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="fflogs.com" /></Field>
          <Field label="설명 (선택)"><input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        </div>
        <FormButtons busy={busy} onClose={onClose} />
      </form>
    </Modal>
  );
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
