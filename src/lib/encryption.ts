// --- Encryption Utilities for Keepr ---

// Generate a key pair for asymmetric encryption
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export public key to a format that can be shared
export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    "spki",
    key
  );
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import public key from shared format
export async function importPublicKey(keyString: string): Promise<CryptoKey> {
  const binaryKey = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

// Generate a random AES-GCM symmetric key
export async function generateSymmetricKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data with AES-GCM
export async function symmetricEncrypt(
  data: string | ArrayBuffer,
  key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = typeof data === "string" ? enc.encode(data) : data;
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encoded
  );
  return { ciphertext, iv };
}

// Export a CryptoKey to raw bytes
export async function exportSymmetricKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey("raw", key);
}

// Encrypt data with RSA-OAEP
export async function asymmetricEncrypt(
  data: Uint8Array,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP"
    },
    publicKey,
    data
  );
}

// Get or generate encryption keys for an address
export async function getEncryptionKeys(address: string): Promise<{ publicKey: string; privateKey: CryptoKey }> {
  // In a real implementation, you would:
  // 1. Check if keys exist in local storage
  // 2. If not, generate new keys
  // 3. Store the public key on-chain associated with the address
  // 4. Store the private key securely in local storage
  
  const keyPair = await generateKeyPair();
  const publicKey = await exportPublicKey(keyPair.publicKey);
  
  // Store the public key (in a real implementation, this would be on-chain)
  localStorage.setItem(`keepr:publicKey:${address}`, publicKey);
  
  return {
    publicKey,
    privateKey: keyPair.privateKey
  };
}

// Get public key for an address
export async function getEncryptionPublicKey(address: string): Promise<string> {
  // In a real implementation, you would:
  // 1. Check local storage first
  // 2. If not found, fetch from the blockchain
  
  const storedKey = localStorage.getItem(`keepr:publicKey:${address}`);
  if (storedKey) {
    return storedKey;
  }
  
  // If not found, generate new keys
  const { publicKey } = await getEncryptionKeys(address);
  return publicKey;
} 