// --- Encryption Utilities for Keepr ---

// Get the public encryption key for an Ethereum address using MetaMask
export async function getEncryptionPublicKey(address: string): Promise<string> {
  if (!(window as any).ethereum) throw new Error("No Ethereum provider found");
  return await (window as any).ethereum.request({
    method: "eth_getEncryptionPublicKey",
    params: [address],
  });
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

// Export a CryptoKey to raw bytes (for asymmetric encryption)
export async function exportSymmetricKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey("raw", key);
}

// Encrypt the symmetric key with a public key (ECIES, MetaMask style)
// MetaMask expects the public key as a hex string, and uses eth-sig-util for ECIES
// We'll use the eth-sig-util package for compatibility (to be installed)
import { encrypt as eciesEncrypt } from "@metamask/eth-sig-util";

export function asymmetricEncrypt(
  data: Uint8Array,
  publicKey: string
): string {
  // MetaMask expects the public key as a base64 string
  // Data should be a Uint8Array (the exported symmetric key)
  const encrypted = eciesEncrypt({
    publicKey,
    data: Buffer.from(data).toString("base64"),
    version: "x25519-xsalsa20-poly1305",
  });
  // Return as JSON string for storage
  return JSON.stringify(encrypted);
} 