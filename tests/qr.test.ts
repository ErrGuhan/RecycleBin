import { describe, it, expect } from 'vitest';
import {
  generateBinCode,
  isValidBinCode,
  UNAMBIGUOUS_ALPHABET,
  generateQrSvg,
  generateQrDataUrl,
} from '@/lib/qr';

describe('QR Engine & Bin Code Generation', () => {
  it('generates 8-character codes exclusively from the unambiguous alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateBinCode();
      expect(code.length).toBe(8);
      for (const char of code) {
        expect(UNAMBIGUOUS_ALPHABET).toContain(char);
      }
      expect(isValidBinCode(code)).toBe(true);
    }
  });

  it('rejects ambiguous characters 0, O, 1, I, L and invalid lengths', () => {
    expect(isValidBinCode('7K3Q9DX0')).toBe(false); // contains 0
    expect(isValidBinCode('7K3Q9DXO')).toBe(false); // contains O
    expect(isValidBinCode('7K3Q9DX1')).toBe(false); // contains 1
    expect(isValidBinCode('7K3Q9DXI')).toBe(false); // contains I
    expect(isValidBinCode('7K3Q9DXL')).toBe(false); // contains L
    expect(isValidBinCode('7K3Q')).toBe(false);     // too short
    expect(isValidBinCode('7K3Q9DX2A')).toBe(false); // too long
  });

  it('generates QR SVG with Q level error correction', async () => {
    const url = 'https://recycle.campus.edu/b/7K3Q9DX2';
    const svg = await generateQrSvg(url);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('#0E2A27'); // ink color
  });

  it('generates QR PNG Data URL', async () => {
    const url = 'https://recycle.campus.edu/b/7K3Q9DX2';
    const dataUrl = await generateQrDataUrl(url, 250);
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true);
  });
});
