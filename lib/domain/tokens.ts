/**
 * Design Tokens and WCAG Contrast Verification Engine
 * Brand: Bisleri Aqua Green Palette & Neutral Neutrals
 */

export interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  role: 'accent-fill' | 'action-text' | 'surface' | 'text' | 'border' | 'status';
  intendedPairs: {
    backgroundVar: string;
    description: string;
    minRatio: number; // e.g., 4.5 for text, 3.0 for large text/ui
  }[];
}

export const TOKENS: Record<string, ColorToken> = {
  brandPrimary: {
    name: 'Brand Primary (Aqua)',
    variable: '--brand-primary',
    hex: '#00B3A1',
    role: 'accent-fill',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Graphic fills & accents only (NEVER normal text on white)',
        minRatio: 2.0, // Non-text graphic contrast
      },
    ],
  },
  brandPrimaryStrong: {
    name: 'Brand Primary Strong',
    variable: '--brand-primary-strong',
    hex: '#00796B',
    role: 'action-text',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Buttons & interactive links on white (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
      {
        backgroundVar: '--brand-primary-soft',
        description: 'Text on tinted background (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
    ],
  },
  brandPrimarySoft: {
    name: 'Brand Primary Soft',
    variable: '--brand-primary-soft',
    hex: '#E0F5F2',
    role: 'surface',
    intendedPairs: [],
  },
  ink: {
    name: 'Ink (Body Text)',
    variable: '--ink',
    hex: '#0E2A27',
    role: 'text',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Primary text on white surface',
        minRatio: 7.0, // High contrast
      },
      {
        backgroundVar: '--surface-alt',
        description: 'Primary text on alternate surface',
        minRatio: 7.0,
      },
    ],
  },
  inkMuted: {
    name: 'Ink Muted (Secondary)',
    variable: '--ink-muted',
    hex: '#4B635F',
    role: 'text',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Secondary text on white surface (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
    ],
  },
  surface: {
    name: 'Surface (White)',
    variable: '--surface',
    hex: '#FFFFFF',
    role: 'surface',
    intendedPairs: [],
  },
  surfaceAlt: {
    name: 'Surface Alternate',
    variable: '--surface-alt',
    hex: '#F4FAF9',
    role: 'surface',
    intendedPairs: [],
  },
  line: {
    name: 'Line / Border',
    variable: '--line',
    hex: '#D5E6E3',
    role: 'border',
    intendedPairs: [],
  },
  warn: {
    name: 'Warning (Amber)',
    variable: '--warn',
    hex: '#B45309',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Pending status text on white (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
    ],
  },
  danger: {
    name: 'Danger (Red)',
    variable: '--danger',
    hex: '#B42318',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Error / Rejected status text on white (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
    ],
  },
  info: {
    name: 'Info (Blue)',
    variable: '--info',
    hex: '#0B5FA5',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Informational text on white (WCAG AA >= 4.5:1)',
        minRatio: 4.5,
      },
    ],
  },
  statusPending: {
    name: 'Status Pending',
    variable: '--status-pending',
    hex: '#B45309',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Pending chip/text on white surface',
        minRatio: 4.5,
      },
    ],
  },
  statusVerified: {
    name: 'Status Verified',
    variable: '--status-verified',
    hex: '#00796B',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Verified badge text on white surface',
        minRatio: 4.5,
      },
    ],
  },
  statusRejected: {
    name: 'Status Rejected',
    variable: '--status-rejected',
    hex: '#B42318',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Rejected status text on white surface',
        minRatio: 4.5,
      },
    ],
  },
  statusCancelled: {
    name: 'Status Cancelled',
    variable: '--status-cancelled',
    hex: '#6B7280',
    role: 'status',
    intendedPairs: [
      {
        backgroundVar: '--surface',
        description: 'Cancelled status text/icon on white surface',
        minRatio: 4.0,
      },
    ],
  },
  typePetSmall: {
    name: 'Type PET Small',
    variable: '--type-pet-small',
    hex: '#00796B',
    role: 'accent-fill',
    intendedPairs: [],
  },
  typePetMedium: {
    name: 'Type PET Medium',
    variable: '--type-pet-medium',
    hex: '#2D6FA6',
    role: 'accent-fill',
    intendedPairs: [],
  },
  typePetLarge: {
    name: 'Type PET Large',
    variable: '--type-pet-large',
    hex: '#A65A2E',
    role: 'accent-fill',
    intendedPairs: [],
  },
  typeRigidOther: {
    name: 'Type Rigid Other',
    variable: '--type-rigid-other',
    hex: '#6B4C8A',
    role: 'accent-fill',
    intendedPairs: [],
  },
  tierBronze: {
    name: 'Tier Bronze',
    variable: '--tier-bronze',
    hex: '#A9673A',
    role: 'accent-fill',
    intendedPairs: [],
  },
  tierSilver: {
    name: 'Tier Silver',
    variable: '--tier-silver',
    hex: '#8A94A6',
    role: 'accent-fill',
    intendedPairs: [],
  },
  tierGold: {
    name: 'Tier Gold',
    variable: '--tier-gold',
    hex: '#C79A3D',
    role: 'accent-fill',
    intendedPairs: [],
  },
  tierPlatinum: {
    name: 'Tier Platinum',
    variable: '--tier-platinum',
    hex: '#7C8CA8',
    role: 'accent-fill',
    intendedPairs: [],
  },
  flowEntry: {
    name: 'Flow Entry (Teal)',
    variable: '--flow-entry',
    hex: '#00796B',
    role: 'accent-fill',
    intendedPairs: [],
  },
  flowPending: {
    name: 'Flow Pending (Amber)',
    variable: '--flow-pending',
    hex: '#B45309',
    role: 'status',
    intendedPairs: [],
  },
  flowVerify: {
    name: 'Flow Verification (Blue)',
    variable: '--flow-verify',
    hex: '#0B5FA5',
    role: 'status',
    intendedPairs: [],
  },
  flowPoints: {
    name: 'Flow Points (Green)',
    variable: '--flow-points',
    hex: '#00796B',
    role: 'status',
    intendedPairs: [],
  },
  flowCert: {
    name: 'Flow Certificate (Purple)',
    variable: '--flow-cert',
    hex: '#6B4C8A',
    role: 'accent-fill',
    intendedPairs: [],
  },
};

/**
 * Convert Hex to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

/**
 * Relative Luminance according to WCAG 2.1
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Contrast Ratio calculation (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(...hexToRgb(hex1));
  const lum2 = relativeLuminance(...hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Evaluate if a pair passes WCAG AA for normal text (>= 4.5)
 */
export function passesWcagAA(hexForeground: string, hexBackground: string): boolean {
  return getContrastRatio(hexForeground, hexBackground) >= 4.5;
}
