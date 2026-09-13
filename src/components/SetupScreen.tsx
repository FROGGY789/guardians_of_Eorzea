import { SANS, SERIF, KR } from './ui';

export function SetupScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'linear-gradient(180deg, var(--w1) 0%, var(--w3) 45%, var(--w6) 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          background: '#fff',
          borderRadius: 4,
          padding: '40px 40px 44px',
          boxShadow: '0 40px 90px -30px rgba(4,50,62,.55)',
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 40, color: 'var(--ink)' }}>&lt;&lt; LUX &gt;&gt;</div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '.4em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            marginTop: 6,
          }}
        >
          Supabase 연결이 필요합니다
        </div>
        <p
          style={{
            fontFamily: KR,
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--muted)',
            lineHeight: 1.9,
            marginTop: 20,
          }}
        >
          로그인·갤러리·권한 관리는 Supabase를 백엔드로 사용합니다. 아직 연결 정보가
          없어요. 아래 순서대로 설정하면 사이트가 켜집니다.
        </p>
        <ol
          style={{
            fontFamily: KR,
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--ink2)',
            lineHeight: 2,
            marginTop: 14,
            paddingLeft: 20,
          }}
        >
          <li>
            <a href="https://supabase.com" style={{ color: 'var(--accent)' }}>
              supabase.com
            </a>
            에서 무료 프로젝트를 만듭니다.
          </li>
          <li>
            <code style={{ background: 'var(--tint)', padding: '1px 6px', borderRadius: 3 }}>
              supabase/schema.sql
            </code>
            의 SQL을 SQL Editor에 붙여넣고 실행합니다.
          </li>
          <li>Settings → API 에서 URL과 anon key를 복사합니다.</li>
          <li>
            프로젝트 루트에{' '}
            <code style={{ background: 'var(--tint)', padding: '1px 6px', borderRadius: 3 }}>.env</code>{' '}
            파일을 만들고 값을 채웁니다:
          </li>
        </ol>
        <pre
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 12.5,
            background: 'var(--ink2)',
            color: '#dff3f4',
            padding: '14px 16px',
            borderRadius: 4,
            marginTop: 14,
            overflowX: 'auto',
          }}
        >
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p
          style={{
            fontFamily: KR,
            fontWeight: 300,
            fontSize: 13,
            color: 'var(--faint)',
            marginTop: 16,
            lineHeight: 1.8,
          }}
        >
          자세한 안내는 저장소의 <b>README.md</b> 를 참고하세요. 설정 후 개발 서버를
          다시 시작하면 로그인 화면이 나타납니다.
        </p>
      </div>
    </div>
  );
}
