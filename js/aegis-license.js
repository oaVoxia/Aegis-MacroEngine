/**
 * Aegis Macro - Client-Side Ed25519 License Verification Engine
 * Validates cryptographically signed JWT software license tokens entirely on-device
 * using the browser-native WebCrypto API. No backend confirmation required.
 */
function base64UrlToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, c => c.charCodeAt(0));
}

function base64UrlDecode(str) {
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = (str + padding).replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

async function verifyLicenseToken(jwtToken, publicKeyBase64) {
  try {
    const parts = jwtToken.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'MALFORMED_TOKEN' };
    }
    const [headerB64, payloadB64, signatureB64] = parts;

    const payload = JSON.parse(base64UrlDecode(payloadB64));

    // Expiration check
    if (payload.expires_at && Date.now() / 1000 > payload.expires_at) {
      return { valid: false, reason: 'LICENSE_EXPIRED', payload };
    }

    // Import public key (SPKI DER base64)
    const binaryKey = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      { name: 'Ed25519' },
      false,
      ['verify']
    );

    const dataBuffer = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signatureBuffer = base64UrlToUint8Array(signatureB64);

    const isValid = await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signatureBuffer,
      dataBuffer
    );

    return {
      valid: isValid,
      tier: payload.tier,
      expiresAt: payload.expires_at,
      owner: payload.sub,
      payload
    };
  } catch (err) {
    console.error('License verification error:', err);
    return { valid: false, reason: 'VERIFICATION_FAILED', error: err.message };
  }
}

// Hardcoded public key for demo (replace with your production key)
const AEGIS_LICENSE_PUBLIC_KEY = 'MCowBQYDK2VwAyEAr+sSgGOvX9KWlsNhc1F9BcK2XPebnMmD2aL7/j1+faU=';

window.verifyLicenseToken = verifyLicenseToken;
window.AEGIS_LICENSE_PUBLIC_KEY = AEGIS_LICENSE_PUBLIC_KEY;
