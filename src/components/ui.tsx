import type { CSSProperties, ReactNode } from 'react';

export const SANS = "'Pretendard Variable', Pretendard, sans-serif";
export const SERIF = "'Instrument Serif', serif";
export const KR = "'Noto Serif KR', serif";

/** Eyebrow + big serif title + optional description used at the top of every tab. */
export function SectionHeader({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow: string;
  title: ReactNode;
  desc?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240 }}>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: '.5em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 46,
            color: 'var(--ink)',
            lineHeight: 1.1,
            marginTop: 10,
          }}
        >
          {title}
        </div>
        {desc && (
          <div
            style={{
              fontFamily: KR,
              fontWeight: 300,
              fontSize: 14,
              color: 'var(--muted)',
              marginTop: 14,
              lineHeight: 1.9,
              maxWidth: 620,
            }}
          >
            {desc}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

/** Standard tab padding wrapper. */
export function Page({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '56px clamp(20px, 5vw, 48px) 96px', animation: 'fadeUp .4s ease' }}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const base: CSSProperties = {
    fontFamily: SANS,
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '.08em',
    padding: '11px 20px',
    borderRadius: 2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform .12s ease, opacity .12s ease',
  };
  const variants: Record<string, CSSProperties> = {
    solid: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
    outline: { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)' },
    ghost: { background: 'transparent', color: 'var(--muted)', border: '1px solid var(--line)' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: 'block' }}>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.14em',
          color: 'var(--faint)',
          textTransform: 'uppercase',
          marginBottom: 7,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--paper2)',
  border: '1px solid var(--line)',
  borderRadius: 2,
  fontFamily: SANS,
  fontSize: 14,
  color: 'var(--ink2)',
};

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: KR,
        fontWeight: 300,
        fontSize: 14,
        color: 'var(--faint)',
        textAlign: 'center',
        padding: '60px 20px',
        border: '1px dashed var(--line)',
        borderRadius: 3,
      }}
    >
      {children}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        padding: '80px 20px',
        color: 'var(--faint)',
        fontFamily: SANS,
        fontSize: 13,
        letterSpacing: '.1em',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          border: '3px solid var(--line)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin .8s linear infinite',
        }}
      />
      {label || 'LOADING…'}
    </div>
  );
}

/** A pill badge (roles, tags, categories). */
export function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.06em',
        padding: '3px 10px',
        borderRadius: 999,
        background: color || 'var(--accent)',
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
