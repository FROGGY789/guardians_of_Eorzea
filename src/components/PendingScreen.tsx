import { useAuth } from '../auth/AuthProvider';
import { OceanBackground } from './OceanBackground';
import { SANS, SERIF, KR } from './ui';

export function PendingScreen() {
  const { signOut, refreshProfile, profile } = useAuth();

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'linear-gradient(180deg, var(--w1) 0%, var(--w3) 45%, var(--w6) 100%)',
      }}
    >
      <OceanBackground />
      <div
        style={{
          position: 'relative',
          maxWidth: 460,
          background: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(6px)',
          borderRadius: 4,
          padding: '40px 36px',
          textAlign: 'center',
          boxShadow: '0 40px 90px -30px rgba(4,50,62,.55)',
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 40, color: 'var(--ink)' }}>&lt;&lt; LUX &gt;&gt;</div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '.36em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          승인 대기 중
        </div>
        <p style={{ fontFamily: KR, fontWeight: 300, fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.9, marginTop: 20 }}>
          {profile?.character_name ? <b style={{ color: 'var(--ink2)' }}>{profile.character_name}</b> : '반갑습니다'}
          님, 가입 신청이 접수되었습니다.
          <br />
          부대장이 명부에서 승인하면 바로 입장할 수 있어요.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 26 }}>
          <button
            onClick={() => refreshProfile()}
            style={{
              padding: '11px 20px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '.06em',
              cursor: 'pointer',
            }}
          >
            승인 확인
          </button>
          <button
            onClick={() => signOut()}
            style={{
              padding: '11px 20px',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--line)',
              borderRadius: 2,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
