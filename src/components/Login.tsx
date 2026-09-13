import { useEffect, useState, type CSSProperties } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getLatestPost } from '../lib/api';
import type { GalleryPost } from '../lib/types';
import { OceanBackground } from './OceanBackground';
import { SANS, SERIF, KR } from './ui';

type Mode = 'login' | 'signup';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [latest, setLatest] = useState<GalleryPost | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [job, setJob] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getLatestPost().then(setLatest);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        if (!characterName.trim()) throw new Error('캐릭터 이름을 입력해주세요.');
        await signUp({ email: email.trim(), password, characterName: characterName.trim(), job: job.trim() });
        setNotice('가입 신청이 접수되었습니다. 부대장의 승인 후 입장할 수 있어요.');
      }
    } catch (err) {
      setError(translate((err as Error).message));
    } finally {
      setBusy(false);
    }
  }

  const glassField: CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    background: 'rgba(255,255,255,.18)',
    border: '1px solid rgba(255,255,255,.55)',
    borderRadius: 2,
    backdropFilter: 'blur(14px)',
    overflow: 'hidden',
  };
  const glassLabel: CSSProperties = {
    width: 98,
    flex: '0 0 98px',
    whiteSpace: 'nowrap',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    fontFamily: KR,
    fontSize: 13,
    color: '#fff',
    borderRight: '1px solid rgba(255,255,255,.35)',
  };
  const glassInput: CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: '15px 14px',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontFamily: SANS,
    fontSize: 15,
    letterSpacing: '.04em',
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '48px 20px 64px',
        background:
          'linear-gradient(180deg, var(--w1) 0%, var(--w2) 18%, var(--w3) 40%, var(--w4) 66%, var(--w5) 88%, var(--w6) 100%)',
      }}
    >
      <OceanBackground />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1100px 700px at 50% 42%, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 58%), linear-gradient(180deg, rgba(255,255,255,.1) 0%, rgba(4,50,62,.28) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header — tagline "투명한 여름의 기록" removed per request */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 34 }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '.62em',
            color: 'var(--ink)',
            textTransform: 'uppercase',
          }}
        >
          FREE COMPANY ARCHIVE
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(56px, 10vw, 86px)',
            color: 'var(--ink)',
            letterSpacing: '.02em',
            lineHeight: 1,
            marginTop: 10,
          }}
        >
          &lt;&lt; LUX &gt;&gt;
        </div>
      </div>

      {/* Floating polaroid — always the most recent gallery photo */}
      <div
        style={{
          position: 'relative',
          width: 'min(340px, 82vw)',
          background: '#fff',
          padding: '20px 20px 68px',
          borderRadius: 3,
          boxShadow: '0 48px 90px -28px rgba(4,50,62,.55), 0 6px 18px rgba(4,50,62,.18)',
          animation: 'bobHome 8s ease-in-out infinite',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: 'translateX(-50%) rotate(-2deg)',
            width: 132,
            height: 26,
            background: 'rgba(255,255,255,.5)',
            border: '1px solid rgba(255,255,255,.6)',
            backdropFilter: 'blur(2px)',
          }}
        />
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            background: 'var(--tint)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {latest?.cover_url ? (
            <img
              src={latest.cover_url}
              alt={latest.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontFamily: KR, fontSize: 12, color: '#8aa3a9', textAlign: 'center', padding: 16 }}>
              첫 갤러리 사진이 올라오면<br />이곳에 표시됩니다
            </span>
          )}
        </div>
        <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', padding: '0 16px' }}>
          <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 24, color: '#20313a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {latest?.title || 'our clearest summer'}
          </div>
          <div style={{ fontFamily: KR, fontWeight: 300, fontSize: 12, color: '#6b7c84', marginTop: 4, letterSpacing: '.18em' }}>
            {latest ? formatSub(latest) : '2026 · 림사 로민사'}
          </div>
        </div>
      </div>

      {/* Auth form */}
      <form onSubmit={submit} style={{ position: 'relative', width: 'min(380px, 92vw)' }}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: '.5em',
            color: '#fff',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          {mode === 'login' ? 'ENTER THE TIDE' : 'JOIN THE CREW'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mode === 'signup' && (
            <>
              <div style={glassField}>
                <div style={glassLabel}>캐릭터명</div>
                <input
                  style={glassInput}
                  placeholder="캐릭터 이름"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                />
              </div>
              <div style={glassField}>
                <div style={glassLabel}>직업</div>
                <input
                  style={glassInput}
                  placeholder="예: 백마도사 (선택)"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                />
              </div>
            </>
          )}
          <div style={glassField}>
            <div style={glassLabel}>이메일</div>
            <input
              style={glassInput}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={glassField}>
            <div style={glassLabel}>비밀번호</div>
            <input
              style={glassInput}
              type="password"
              placeholder={mode === 'signup' ? '6자 이상' : '비밀번호'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              marginTop: 2,
              padding: 15,
              background: '#fff',
              color: 'var(--ink)',
              border: 'none',
              borderRadius: 2,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '.42em',
              cursor: busy ? 'wait' : 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? '...' : mode === 'login' ? '입장' : '가입 신청'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, textAlign: 'center', fontFamily: SANS, fontSize: 12.5, color: '#ffe3d6', background: 'rgba(120,30,20,.35)', padding: '8px 10px', borderRadius: 2 }}>
            {error}
          </div>
        )}
        {notice && (
          <div style={{ marginTop: 12, textAlign: 'center', fontFamily: KR, fontSize: 13, color: '#eafff6', background: 'rgba(12,80,60,.4)', padding: '10px 12px', borderRadius: 2, lineHeight: 1.6 }}>
            {notice}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontFamily: SANS, fontSize: 12, color: '#fff', letterSpacing: '.03em' }}>
          {mode === 'login' ? (
            <>
              처음 오셨나요?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }} style={linkBtn}>
                부대 가입 신청
              </button>
            </>
          ) : (
            <>
              이미 부대원이신가요?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }} style={linkBtn}>
                로그인
              </button>
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 10, fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,.75)', letterSpacing: '.04em' }}>
          가입은 부대장 승인 후 입장 가능합니다
        </div>
      </form>
    </div>
  );
}

const linkBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#fff',
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 12,
  textDecoration: 'underline',
  cursor: 'pointer',
  padding: 0,
};

function formatSub(p: GalleryPost): string {
  const d = new Date(p.created_at);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const parts = [p.location, p.author?.character_name].filter(Boolean);
  return parts.length ? `${date} · ${parts.join(' · ')}` : date;
}

function translate(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (m.includes('already registered') || m.includes('already been registered')) return '이미 가입된 이메일입니다.';
  if (m.includes('password should be')) return '비밀번호는 6자 이상이어야 합니다.';
  if (m.includes('unable to validate email') || m.includes('invalid email')) return '이메일 형식을 확인해주세요.';
  if (m.includes('email not confirmed')) return '이메일 인증이 필요합니다. 메일함을 확인해주세요.';
  return msg;
}
