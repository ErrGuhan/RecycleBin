import QRCode from 'qrcode';

// Unambiguous alphabet: 30 characters (no 0, O, 1, I, L)
export const UNAMBIGUOUS_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Generate an 8-character unique, random, non-sequential bin code
 */
export function generateBinCode(): string {
  let result = '';
  const alphabetLength = UNAMBIGUOUS_ALPHABET.length;
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * alphabetLength);
    result += UNAMBIGUOUS_ALPHABET[randomIndex];
  }
  return result;
}

/**
 * Validate whether a code conforms to the 8-character unambiguous alphabet
 */
export function isValidBinCode(code: string): boolean {
  if (!code || code.length !== 8) return false;
  const regex = new RegExp(`^[${UNAMBIGUOUS_ALPHABET}]{8}$`);
  return regex.test(code.toUpperCase());
}

/**
 * Generate QR code as SVG string (Error correction Q, quiet zone 4)
 */
export async function generateQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 4,
    color: {
      dark: '#0E2A27', // Ink color
      light: '#FFFFFF',
    },
  });
}

/**
 * Generate QR code as Data URL PNG (for PDF embeds and images)
 */
export async function generateQrDataUrl(url: string, width: number = 320): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'Q',
    margin: 4,
    width,
    color: {
      dark: '#0E2A27',
      light: '#FFFFFF',
    },
  });
}
