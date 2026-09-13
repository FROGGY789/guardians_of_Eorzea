// Theme palettes lifted directly from the LUX canvas design.
export type ThemeKey = 'aqua' | 'coral' | 'abyss' | 'jade';

export interface ThemeVars {
  w1: string;
  w2: string;
  w3: string;
  w4: string;
  w5: string;
  w6: string;
  ink: string;
  ink2: string;
  muted: string;
  faint: string;
  accent: string;
  gold: string;
  line: string;
  line2: string;
  paper: string;
  paper2: string;
  tint: string;
}

export interface Theme {
  name: string;
  dot: string;
  vars: ThemeVars;
}

export const THEMES: Record<ThemeKey, Theme> = {
  aqua: {
    name: '투명한 청록',
    dot: '#63cfd0',
    vars: {
      w1: '#dff3f4', w2: '#a7e4e2', w3: '#63cfd0', w4: '#1f9fae', w5: '#0c6d80', w6: '#075365',
      ink: '#064b5b', ink2: '#0f2b33', muted: '#5a6f77', faint: '#8aa3a9', accent: '#0f6b7a',
      gold: '#c9893f', line: '#e2ded1', line2: '#ece8dc', paper: '#fbfaf6', paper2: '#f2fafa', tint: '#eef6f6',
    },
  },
  coral: {
    name: '산호 노을',
    dot: '#f0865f',
    vars: {
      w1: '#fff3e9', w2: '#ffdcc4', w3: '#ffb694', w4: '#f0865f', w5: '#c2543c', w6: '#8f3527',
      ink: '#6b2417', ink2: '#3a1a12', muted: '#7d5546', faint: '#ac8877', accent: '#c2543c',
      gold: '#a9762a', line: '#ecdfd2', line2: '#f3e8dd', paper: '#fffaf4', paper2: '#fff2e8', tint: '#fdeee4',
    },
  },
  abyss: {
    name: '심해 밤',
    dot: '#25506d',
    vars: {
      w1: '#d7e5ee', w2: '#9dbdd2', w3: '#5f8daa', w4: '#2f6289', w5: '#173d5c', w6: '#0c2440',
      ink: '#0b2740', ink2: '#10293c', muted: '#4c6577', faint: '#87a0b1', accent: '#1d5478',
      gold: '#a8823c', line: '#dde4ea', line2: '#e9eef3', paper: '#f8fafc', paper2: '#eef3f8', tint: '#e7eef5',
    },
  },
  jade: {
    name: '에메랄드 숲',
    dot: '#3d9e77',
    vars: {
      w1: '#eaf7ef', w2: '#c2e8ce', w3: '#8bd0a6', w4: '#3d9e77', w5: '#1c6f56', w6: '#12513f',
      ink: '#0c3b2e', ink2: '#12332a', muted: '#4f6d60', faint: '#8aa598', accent: '#1c6f56',
      gold: '#ae8a34', line: '#e1e5d9', line2: '#eceee3', paper: '#fbfbf6', paper2: '#eff7f1', tint: '#e9f3ec',
    },
  },
};

export const THEME_KEYS = Object.keys(THEMES) as ThemeKey[];

// Build a CSS custom-property string for a theme, e.g. "--w1: #dff3f4; --w2: ...".
export function themeVarString(key: ThemeKey): string {
  const v = THEMES[key].vars;
  return (Object.keys(v) as (keyof ThemeVars)[]).map((k) => `--${k}: ${v[k]}`).join('; ');
}

// Build a React style object of the theme's CSS variables.
export function themeVarStyle(key: ThemeKey): Record<string, string> {
  const v = THEMES[key].vars;
  const out: Record<string, string> = {};
  (Object.keys(v) as (keyof ThemeVars)[]).forEach((k) => {
    out[`--${k}`] = v[k];
  });
  return out;
}
