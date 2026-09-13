import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { Profile, MemberRole } from '../lib/types';
import { Page, SectionHeader, Button, Badge, Spinner, Empty, inputStyle, SANS, SERIF, KR } from '../components/ui';

export function AdminPage() {
  const { profile: me, refreshProfile } = useAuth();
  const [all, setAll] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [secretCode, setSecretCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [codeSaving, setCodeSaving] = useState(false);
  const [codeSaved, setCodeSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (error) console.error(error);
    setAll((data as Profile[]) ?? []);
    const { data: cfg } = await supabase.from('fc_config').select('secret_code').eq('id', 1).maybeSingle();
    if (cfg?.secret_code) { setSecretCode(cfg.secret_code); setCodeInput(cfg.secret_code); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function saveSecretCode() {
    if (!codeInput.trim()) return alert('시크릿코드를 입력해주세요.');
    setCodeSaving(true);
    const { error } = await supabase.from('fc_config').update({ secret_code: codeInput.trim(), updated_at: new Date().toISOString() }).eq('id', 1);
    setCodeSaving(false);
    if (error) return alert('변경 실패: ' + error.message);
    setSecretCode(codeInput.trim());
    setCodeSaved(true);
    setTimeout(() => setCodeSaved(false), 2500);
  }

  const pending = all.filter((p) => p.role === 'pending');
  const active = all.filter((p) => p.role !== 'pending');

  async function patch(id: string, changes: Partial<Profile>) {
    setSavingId(id);
    const { error } = await supabase.from('profiles').update(changes).eq('id', id);
    setSavingId(null);
    if (error) { alert('변경 실패: ' + error.message); return; }
    await load();
    if (id === me?.id) await refreshProfile();
  }

  async function approve(p: Profile) {
    await patch(p.id, { role: 'member', can_write: true, joined_at: new Date().toISOString() });
  }

  async function reject(p: Profile) {
    if (!confirm(`${p.character_name}님의 가입 신청을 거절할까요? 프로필이 삭제됩니다.`)) return;
    setSavingId(p.id);
    const { error } = await supabase.from('profiles').delete().eq('id', p.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    load();
  }

  async function removeMember(p: Profile) {
    if (p.id === me?.id) return alert('자기 자신은 삭제할 수 없습니다.');
    if (!confirm(`${p.character_name}님을 부대에서 내보낼까요?`)) return;
    setSavingId(p.id);
    const { error } = await supabase.from('profiles').delete().eq('id', p.id);
    setSavingId(null);
    if (error) { alert(error.message); return; }
    load();
  }

  return (
    <Page>
      <SectionHeader
        eyebrow="Company Admin"
        title="부대 관리"
        desc="가입 승인과 부대원 권한을 관리합니다. 부대장(관리자)만 볼 수 있는 화면입니다."
      />

      {/* Secret code */}
      <div style={{ marginTop: 36, padding: '20px 22px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4 }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, color: 'var(--ink)' }}>부대 가입 시크릿코드</div>
        <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.7 }}>
          새 부대원은 가입 시 이 코드를 입력해야 합니다. 부대원들에게만 알려주세요.
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            style={{ ...inputStyle, width: 220, letterSpacing: '.1em', fontFamily: 'ui-monospace, monospace' }}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="예: LUX-2026"
          />
          <Button onClick={saveSecretCode} disabled={codeSaving || codeInput.trim() === secretCode}>
            {codeSaving ? '저장 중…' : '코드 변경'}
          </Button>
          {codeSaved && <span style={{ fontFamily: SANS, fontSize: 12.5, color: 'var(--accent)' }}>✓ 변경되었습니다</span>}
        </div>
      </div>

      {/* Pending approvals */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: 'var(--ink)' }}>가입 승인 대기</div>
          {pending.length > 0 && <Badge color="var(--gold)">{pending.length}</Badge>}
          <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
        </div>

        {loading ? <Spinner /> : pending.length === 0 ? (
          <Empty>대기 중인 가입 신청이 없어요.</Empty>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pending.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4, flexWrap: 'wrap' }}>
                <Avatar p={p} />
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: 'var(--ink2)' }}>{p.character_name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.job || '직업 미설정'} · 신청 {fmt(p.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button onClick={() => approve(p)} disabled={savingId === p.id}>승인</Button>
                  <Button variant="ghost" onClick={() => reject(p)} disabled={savingId === p.id} style={{ color: '#b3402b', borderColor: '#e6c3ba' }}>거절</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active members */}
      <div style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ fontFamily: SERIF, fontSize: 24, color: 'var(--ink)' }}>부대원 권한 관리</div>
          <div style={{ height: 1, flex: 1, background: 'var(--line)' }} />
        </div>

        {!loading && active.length === 0 ? <Empty>부대원이 없어요.</Empty> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map((p) => {
              const isSelf = p.id === me?.id;
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 4, flexWrap: 'wrap' }}>
                  <Avatar p={p} />
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, color: 'var(--ink2)' }}>{p.character_name}</span>
                      {p.role === 'admin' && <Badge color="var(--gold)">부대장</Badge>}
                      {isSelf && <span style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)' }}>(나)</span>}
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.job || '직업 미설정'} · 가입 {fmt(p.joined_at)}</div>
                  </div>

                  {/* Rank */}
                  <input
                    style={{ ...inputStyle, width: 110, padding: '8px 10px' }}
                    defaultValue={p.rank || ''}
                    placeholder="계급"
                    onBlur={(e) => { if (e.target.value !== (p.rank || '')) patch(p.id, { rank: e.target.value || null }); }}
                  />

                  {/* Role */}
                  <select
                    style={{ ...inputStyle, width: 120, padding: '8px 10px', appearance: 'auto' }}
                    value={p.role}
                    disabled={isSelf}
                    onChange={(e) => patch(p.id, { role: e.target.value as MemberRole })}
                  >
                    <option value="admin">부대장</option>
                    <option value="member">대원</option>
                  </select>

                  {/* can_write toggle */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 12.5, color: 'var(--muted)', cursor: p.role === 'admin' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="checkbox"
                      checked={p.role === 'admin' ? true : p.can_write}
                      disabled={p.role === 'admin' || savingId === p.id}
                      onChange={(e) => patch(p.id, { can_write: e.target.checked })}
                    />
                    글쓰기
                  </label>

                  {!isSelf && (
                    <button onClick={() => removeMember(p)} disabled={savingId === p.id} style={{ background: 'none', border: 'none', color: '#b3402b', fontSize: 11.5, cursor: 'pointer', fontFamily: SANS }}>내보내기</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 36, padding: '18px 20px', background: 'var(--tint)', borderRadius: 4, fontFamily: KR, fontWeight: 300, fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
        <b style={{ fontFamily: SANS, fontWeight: 600, color: 'var(--ink2)' }}>권한 안내</b><br />
        · <b>부대장</b>: 모든 글쓰기·삭제와 부대원 관리 권한을 가집니다.<br />
        · <b>글쓰기</b> 체크: 갤러리·공지·일지·레이드 등에 글을 올릴 수 있습니다. 해제하면 열람만 가능합니다.<br />
        · 방명록은 모든 부대원이 남길 수 있습니다.
      </div>
    </Page>
  );
}

function Avatar({ p }: { p: Profile }) {
  return (
    <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: p.avatar_url ? `url(${p.avatar_url}) center/cover` : 'linear-gradient(150deg, var(--w2), var(--accent))', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: SERIF, fontSize: 20 }}>
      {!p.avatar_url && p.character_name.charAt(0)}
    </div>
  );
}

const fmt = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`; };
