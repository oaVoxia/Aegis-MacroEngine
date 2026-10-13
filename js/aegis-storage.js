/**
 * Aegis Macro - Client-Side Encrypted Storage
 * AES-256-GCM via WebCrypto API
 * Zero-knowledge: all portfolio data, API keys, and state remain on-device.
 */
class AegisStorage {
  constructor() {
    this.dbName = 'AegisMacroDB';
    this.storeName = 'encryptedStore';
    this.keyName = 'aegis-master-key';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deriveKey(password = 'aegis-local-session') {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('aegis-macro-salt-v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    const key = await this.deriveKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    };
  }

  async decrypt(encrypted) {
    const key = await this.deriveKey();
    const iv = new Uint8Array(encrypted.iv);
    const data = new Uint8Array(encrypted.data);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async save(key, value) {
    if (!this.db) await this.init();
    const encrypted = await this.encrypt(value);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(encrypted, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async load(key) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(key);
      req.onsuccess = async () => {
        if (!req.result) return resolve(null);
        try {
          const data = await this.decrypt(req.result);
          resolve(data);
        } catch (e) {
          console.error('Decryption failed:', e);
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

window.AegisStorage = AegisStorage;
