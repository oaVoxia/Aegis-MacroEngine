# Aegis-MacroEngine

Aegis Macro is an enterprise-grade, privacy-first portfolio dashboard engineered for institutional stock and cryptocurrency management. Featuring a slate, steel blue, and mint interface, it delivers real-time cross-asset correlation, VaR risk metrics, and TradFi versus DeFi yield models—secured entirely via client-side AES-256 encryption.

## Architecture

- **Zero-Knowledge Local-First SPA**: All portfolio state, holdings, and licenses live in IndexedDB encrypted with AES-GCM-256 via the WebCrypto API. Nothing is transmitted to a central backend.
- **Web3 Wallet Engine**: EIP-1193 `window.ethereum` integration (MetaMask / Rabby) for address reading and `personal_sign` session authorization. Read-only scope.
- **Client-Side License Verification**: Ed25519 signature validation of JWT license tokens entirely in the browser using `crypto.subtle`.
- **Dual Payment Rails**: Stripe Checkout (fiat) and Sphere Pay (USDC/USDT) client handlers (backend session endpoints required for production).
- **Glassmorphic UI**: Tailwind + Chart.js dashboard with Macro Overview, Risk & Correlations, Yield Mapper, Local Asset Manager, and Enterprise Plans.

## Modules

| File | Purpose |
|------|---------|
| `Aegis_Macro_Dashboard.html` | Main SPA entry point |
| `js/aegis-storage.js` | AES-GCM encrypted IndexedDB persistence |
| `js/aegis-wallet.js` | Web3 wallet connection & signature |
| `js/aegis-license.js` | Ed25519 JWT license verification |
| `js/aegis-payments.js` | Stripe + Sphere Pay payment processor |

## Demo License

A pre-signed Desk-tier license is provisioned on mock payment success for local verification testing.

Public key (SPKI DER Base64):
```
MCowBQYDK2VwAyEAr+sSgGOvX9KWlsNhc1F9BcK2XPebnMmD2aL7/j1+faU=
```

## Running

Serve the directory with any static server (e.g. `npx serve` or GitHub Pages). Open `index.html` or `Aegis_Macro_Dashboard.html`.

All cryptographic operations and storage remain strictly client-side.
