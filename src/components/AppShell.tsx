import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useTheme } from '../theme/ThemeProvider';
import { THEME_KEYS, THEMES } from '../theme/themes';
import { SANS, SERIF } from './ui';
import { GalleryPage } from '../pages/GalleryPage';
import { NoticePage } from '../pages/NoticePage';
import { RosterPage } from '../pages/RosterPage';
import { RaidPage } from '../pages/RaidPage';
import { HousingPage } from '../pages/HousingPage';
import { DiaryPage } from '../pages/DiaryPage';
import { LinksPage } from '../pages/LinksPage';
import { GuestbookPage } from '../pages/GuestbookPage';
import { AdminPage } from '../pages/AdminPage';

const TABS = [
  '갤러리',
  '공지·일정',
  '부대원 명부',
  '레이드 기록',
  '하우징',
  '일지',
  '링크 모음',
  '방명록',
] as const;

export function AppShell() {
  const { profile, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = isAdmin ? [...TABS, '부대 관리'] : [...TABS];

  function renderTab() {
    switch (tabs[tab]) {
      case '갤러리': return <GalleryPage onOpenTab={setTab} />;
      case '공지·일정': return <NoticePage />;
      case '부대원 명부': return <RosterPage />;
      case '레이드 기록': return <RaidPage />;
      case '하우징': return <HousingPage />;
      case '일지': return <DiaryPage />;
      case '링크 모음': return <LinksPage />;
      case '방명록': return <GuestbookPage />;
      case '부대 관리': return <AdminPage />;
      default: return null;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink2)' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          padding: '0 clamp(16px, 4vw, 48px)',
          background: 'var(--paper)',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          height: 74,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
          <div style={{ fontFamily: SERIF, fontSize: 28, color: 'var(--ink)', letterSpacing: '.01em' }}>
            &lt;&lt; LUX &gt;&gt;
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 10,
              letterSpacing: '.42em',
              color: 'var(--faint)',
              textTransform: 'uppercase',
            }}
            className="lux-hide-sm"
          >
            ARCHIVE
          </div>
        </div>

        <nav
          style={{
            display: 'flex',
            gap: 2,
            flex: 1,
            marginLeft: 8,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                padding: '8px 11px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${i === tab ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer',
                fontFamily: SANS,
                fontWeight: i === tab ? 600 : 500,
                fontSize: 14,
                color: i === tab ? 'var(--ink)' : 'var(--muted)',
                whiteSpace: 'nowrap',
                letterSpacing: '-.01em',
              }}
            >
              {t}
            </button>
          ))}
        </nav>

        {/* Theme switcher */}
        <div
          className="lux-hide-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingRight: 16,
            borderRight: '1px solid var(--line)',
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 10, letterSpacing: '.24em', color: 'var(--faint)' }}>
            THEME
          </span>
          <div style={{ display: 'flex', gap: 7 }}>
            {THEME_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setTheme(k)}
                title={THEMES[k].name}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: THEMES[k].dot,
                  border: `2px solid ${k === theme ? 'var(--ink)' : 'transparent'}`,
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* User */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ textAlign: 'right' }} className="lux-hide-sm">
              <div style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)', letterSpacing: '.1em' }}>
                {isAdmin ? 'FC MASTER' : profile?.rank || 'MEMBER'}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: 'var(--ink2)' }}>
                {profile?.character_name}
              </div>
            </div>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: profile?.avatar_url
                  ? `url(${profile.avatar_url}) center/cover`
                  : 'linear-gradient(150deg, var(--w2), var(--accent))',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontFamily: SERIF,
                fontSize: 18,
              }}
            >
              {!profile?.avatar_url && profile?.character_name?.charAt(0)}
            </div>
          </button>

          {menuOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setMenuOpen(false)} />
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  right: 0,
                  zIndex: 31,
                  minWidth: 180,
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  boxShadow: '0 20px 40px -18px rgba(6,40,50,.4)',
                  padding: 8,
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--line)', marginBottom: 6 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 14, color: 'var(--ink2)' }}>
                    {profile?.character_name}
                  </div>
                  <div style={{ fontFamily: SANS, fontSize: 11, color: 'var(--faint)', marginTop: 2 }}>
                    {profile?.job || '직업 미설정'} · {isAdmin ? '부대장' : profile?.rank || '대원'}
                  </div>
                </div>
                {/* mobile theme picker */}
                <div className="lux-show-sm" style={{ display: 'none', gap: 7, padding: '6px 10px 10px' }}>
                  {THEME_KEYS.map((k) => (
                    <button
                      key={k}
                      onClick={() => setTheme(k)}
                      title={THEMES[k].name}
                      style={{
                        width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                        background: THEMES[k].dot,
                        border: `2px solid ${k === theme ? 'var(--ink)' : 'transparent'}`,
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '9px 10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: SANS,
                    fontSize: 13,
                    color: 'var(--muted)',
                    borderRadius: 3,
                  }}
                >
                  로그아웃
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main>{renderTab()}</main>

      <footer
        style={{
          textAlign: 'center',
          padding: '40px 20px 56px',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--faint)',
          borderTop: '1px solid var(--line)',
        }}
      >
        all tides return — &lt;&lt; LUX &gt;&gt; · {new Date().getFullYear()}
      </footer>

      <style>{`
        @media (max-width: 720px) {
          .lux-hide-sm { display: none !important; }
          .lux-show-sm { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
