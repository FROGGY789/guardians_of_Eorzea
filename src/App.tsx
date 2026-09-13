import { useAuth } from './auth/AuthProvider';
import { useTheme } from './theme/ThemeProvider';
import { themeVarStyle } from './theme/themes';
import { isSupabaseConfigured } from './lib/supabase';
import { Login } from './components/Login';
import { AppShell } from './components/AppShell';
import { SetupScreen } from './components/SetupScreen';
import { PendingScreen } from './components/PendingScreen';
import { Spinner } from './components/ui';

export function App() {
  const { theme } = useTheme();
  const { session, profile, loading, isApproved } = useAuth();

  // Every screen lives inside the theme-variable wrapper.
  const themed = (children: React.ReactNode) => (
    <div style={{ ...themeVarStyle(theme), minHeight: '100vh', background: 'var(--paper)' }}>
      {children}
    </div>
  );

  if (!isSupabaseConfigured) return themed(<SetupScreen />);

  if (loading) {
    return themed(
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spinner label="불러오는 중…" />
      </div>,
    );
  }

  if (!session) return themed(<Login />);

  // Signed in but the profile row hasn't loaded or approval is pending.
  if (!profile || !isApproved) return themed(<PendingScreen />);

  return themed(<AppShell />);
}
