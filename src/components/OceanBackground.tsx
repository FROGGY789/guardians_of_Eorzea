/** The animated ocean/caustics backdrop from the LUX login canvas. */
export function OceanBackground() {
  return (
    <svg
      viewBox="0 0 1440 940"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden
    >
      <defs>
        <filter id="cau" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.022" numOctaves={4} seed={11} result="n">
            <animate
              attributeName="baseFrequency"
              dur="26s"
              repeatCount="indefinite"
              values="0.009 0.022; 0.012 0.026; 0.008 0.02; 0.009 0.022"
            />
          </feTurbulence>
          <feColorMatrix in="n" type="matrix" result="m" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.42" />
          <feGaussianBlur in="m" stdDeviation="0.7" />
        </filter>
        <filter id="cau2" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves={3} seed={4} result="n2">
            <animate
              attributeName="baseFrequency"
              dur="18s"
              repeatCount="indefinite"
              values="0.02 0.05; 0.026 0.058; 0.018 0.046; 0.02 0.05"
            />
          </feTurbulence>
          <feColorMatrix in="n2" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.9 0 0 0 -0.58" />
        </filter>
        <filter id="sand" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={4} seed={3} result="s" />
          <feColorMatrix in="s" type="matrix" values="0 0 0 0 0.99  0 0 0 0 0.96  0 0 0 0 0.87  0.35 0 0 0 -0.02" />
        </filter>
        <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity=".25" />
        </linearGradient>
        <mask id="mFade">
          <rect width="1440" height="940" fill="url(#fadeDown)" />
        </mask>
        <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6efdc" stopOpacity=".85" />
          <stop offset="1" stopColor="#f6efdc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,0 L1440,0 L1440,210 C1150,260 980,180 700,225 C430,268 220,200 0,240 Z" fill="url(#shelf)" />
      <rect width="1440" height="320" filter="url(#sand)" opacity=".5" />
      <rect width="1440" height="940" filter="url(#cau)" opacity=".55" mask="url(#mFade)" />
      <rect width="1440" height="940" filter="url(#cau2)" opacity=".3" mask="url(#mFade)" />
      <g opacity=".4" style={{ mixBlendMode: 'screen' }}>
        <path d="M250,-40 L360,-40 L120,940 L40,940 Z" fill="#ffffff" opacity=".22" style={{ animation: 'rayShift 14s ease-in-out infinite' }} />
        <path d="M700,-40 L790,-40 L600,940 L520,940 Z" fill="#ffffff" opacity=".16" style={{ animation: 'rayShift 19s ease-in-out infinite' }} />
        <path d="M1180,-40 L1260,-40 L1080,940 L1010,940 Z" fill="#ffffff" opacity=".2" style={{ animation: 'rayShift 22s ease-in-out infinite' }} />
      </g>
      <g fill="none" stroke="#ffffff" strokeLinecap="round">
        <path d="M-60,120 Q120,100 300,122 T660,118 T1020,124 T1380,116 T1500,122" strokeWidth="2" opacity=".5" />
        <path d="M-60,180 Q140,158 320,182 T680,176 T1040,184 T1400,174" strokeWidth="1.6" opacity=".38" />
        <path d="M-60,262 Q160,238 340,264 T700,256 T1060,266 T1420,254" strokeWidth="1.4" opacity=".3" />
        <path d="M-60,360 Q180,332 360,362 T720,352 T1080,364 T1440,350" strokeWidth="1.2" opacity=".22" />
      </g>
      <g style={{ animation: 'foamDrift 24s linear infinite' }}>
        <path d="M-200,66 Q0,44 200,66 T600,64 T1000,68 T1400,62 T1800,66" fill="none" stroke="#ffffff" strokeWidth="10" opacity=".55" strokeLinecap="round" />
        <path d="M-200,84 Q20,66 220,86 T620,82 T1020,88 T1420,80 T1820,86" fill="none" stroke="#ffffff" strokeWidth="4" opacity=".4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
