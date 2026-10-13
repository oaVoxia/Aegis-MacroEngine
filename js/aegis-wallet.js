/**
 * Aegis Macro - Web3 Wallet Connection Engine
 * Supports MetaMask, Rabby, and any EIP-1193 provider (window.ethereum)
 * Read-only scope: personal_sign + balance telemetry only.
 */
async function connectWeb3Wallet() {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('No EVM wallet provider detected (MetaMask or Rabby required).');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    const walletAddress = accounts[0];

    const message = `Aegis Macro Session Auth\nTimestamp: ${Date.now()}\nAddress: ${walletAddress}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress]
    });

    // Optional: fetch balance (read-only)
    let balance = null;
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest']
      });
      balance = parseInt(balanceHex, 16) / 1e18;
    } catch (_) { /* ignore */ }

    return {
      address: walletAddress,
      signature,
      timestamp: Date.now(),
      balance
    };
  } catch (err) {
    console.error('Wallet connection failed:', err);
    throw err;
  }
}

// Listen for account changes
function setupWalletListeners(onAccountsChanged) {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  }
}

window.connectWeb3Wallet = connectWeb3Wallet;
window.setupWalletListeners = setupWalletListeners;
