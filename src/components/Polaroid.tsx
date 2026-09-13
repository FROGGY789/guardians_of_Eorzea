import type { CSSProperties } from 'react';
import { SERIF, KR, SANS } from './ui';

/** The signature LUX polaroid: white frame, square photo, handwritten caption. */
export function Polaroid({
  src,
  title,
  subtitle,
  rotate = 0,
  onClick,
  size = 'md',
  placeholder,
}: {
  src?: string | null;
  title?: string;
  subtitle?: string;
  rotate?: number;
  onClick?: () => void;
  size?: 'md' | 'lg';
  placeholder?: string;
}) {
  const pad = size === 'lg' ? '22px 22px 26px' : '12px 12px 18px';
  const frame: CSSProperties = {
    background: '#fff',
    padding: pad,
    boxShadow:
      size === 'lg'
        ? '0 40px 70px -30px rgba(15,43,51,.4), 0 4px 14px rgba(15,43,51,.08)'
        : '0 18px 34px -20px rgba(15,43,51,.3)',
    transform: `rotate(${rotate}deg)`,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform .18s ease, box-shadow .18s ease',
  };

  return (
    <div
      style={frame}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'rotate(0deg) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 30px 50px -22px rgba(15,43,51,.45)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = `rotate(${rotate}deg)`;
          e.currentTarget.style.boxShadow = frame.boxShadow as string;
        }
      }}
    >
      <div
        style={{
          aspectRatio: '1 / 1',
          background: 'var(--tint)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <span
            style={{
              fontFamily: KR,
              fontSize: 12,
              color: 'var(--faint)',
              padding: 12,
              textAlign: 'center',
            }}
          >
            {placeholder || '사진 없음'}
          </span>
        )}
      </div>
      {(title || subtitle) && (
        <div style={{ marginTop: size === 'lg' ? 18 : 12, textAlign: 'center' }}>
          {title && (
            <div
              style={{
                fontFamily: size === 'lg' ? SERIF : KR,
                fontStyle: size === 'lg' ? 'italic' : 'normal',
                fontSize: size === 'lg' ? 26 : 14,
                color: '#20313a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: '#8f9ea5',
                marginTop: size === 'lg' ? 6 : 4,
                letterSpacing: '.1em',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
