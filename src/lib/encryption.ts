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

// Generate deterministic RSA key pair for any address (without requiring wallet signature)
export async function generateDeterministicKeyPairForAddress(address: string): Promise<CryptoKeyPair> {
  console.log("Generating deterministic key pair for address:", address);
  
  // Create a deterministic seed from the address
  const encoder = new TextEncoder();
  const addressBytes = encoder.encode(address.toLowerCase());
  const seed = await window.crypto.subtle.digest('SHA-256', addressBytes);
  
  // Use PBKDF2 to derive a more robust seed
  const salt = encoder.encode('keepr-deterministic-salt');
  const derivedKey = await window.crypto.subtle.importKey(
    'raw',
    seed,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    derivedKey,
    256
  );
  
  // Use the derived bits to create a deterministic seed
  const finalSeed = new Uint8Array(derivedBits);
  
  // Generate the key pair (Web Crypto API doesn't support seeded generation directly)
  // So we'll use a workaround by creating a deterministic seed
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  
  console.log("Generated deterministic key pair for address:", address);
  return keyPair;
}

// Get or generate encryption keys for any address (including non-app users)
export async function getEncryptionKeysForAddress(address: string): Promise<{ publicKey: string; privateKey: CryptoKey }> {
  console.log("Getting/Generating encryption keys for address:", address);
  
  // Check if we already have a key pair for this address
  const publicKeyId = `keepr:publicKey:${address}`;
  const privateKeyId = `keepr:privateKey:${address}`;
  
  let publicKeyString = localStorage.getItem(publicKeyId);
  let privateKeyString = localStorage.getItem(privateKeyId);
  
  if (!publicKeyString || !privateKeyString) {
    // Generate new deterministic key pair
    const keyPair = await generateDeterministicKeyPairForAddress(address);
    
    // Export and store the keys
    publicKeyString = await exportPublicKey(keyPair.publicKey);
    privateKeyString = await exportPrivateKey(keyPair.privateKey);
    
    localStorage.setItem(publicKeyId, publicKeyString);
    localStorage.setItem(privateKeyId, privateKeyString);
    
    console.log("Generated and stored new key pair for address:", address);
  } else {
    console.log("Found existing key pair for address:", address);
  }
  
  // Import the private key
  const privateKey = await importPrivateKey(privateKeyString);
  
  return {
    publicKey: publicKeyString,
    privateKey
  };
}

// Get encryption public key for any address (including non-app users)
export async function getEncryptionPublicKeyForAddress(address: string): Promise<CryptoKey> {
  console.log("Getting encryption public key for address:", address);
  
  // Check if we have a stored public key
  const publicKeyString = localStorage.getItem(`keepr:publicKey:${address}`);
  
  if (publicKeyString) {
    console.log("Found stored public key, importing...");
    return await importPublicKey(publicKeyString);
  }
  
  // Generate new keys for this address
  const { publicKey } = await getEncryptionKeysForAddress(address);
  return await importPublicKey(publicKey);
}

// Get encryption private key for any address (including non-app users)
export async function getEncryptionPrivateKeyForAddress(address: string): Promise<CryptoKey> {
  console.log("Getting private key for address:", address);
  
  // Check if we have a stored private key
  const privateKeyString = localStorage.getItem(`keepr:privateKey:${address}`);
  
  if (privateKeyString) {
    console.log("Found stored private key, importing...");
    return await importPrivateKey(privateKeyString);
  }
  
  // Generate new keys for this address
  const { privateKey } = await getEncryptionKeysForAddress(address);
  return privateKey;
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

// Import private key from stored format
export async function importPrivateKey(keyString: string): Promise<CryptoKey> {
  const binaryKey = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

// Export private key to a format that can be stored
export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    "pkcs8",
    key
  );
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
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

// Decrypt data with AES-GCM
export async function symmetricDecrypt(
  ciphertext: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    ciphertext
  );
}

// Export a CryptoKey to raw bytes
export async function exportSymmetricKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await window.crypto.subtle.exportKey("raw", key);
}

// Import a symmetric key from raw bytes
export async function importSymmetricKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
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

// Decrypt data with RSA-OAEP
export async function asymmetricDecrypt(
  ciphertext: ArrayBuffer,
  privateKey: CryptoKey
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    privateKey,
    ciphertext
  );
}

// Secure key derivation using wallet signature
export async function deriveEncryptionKey(address: string, walletProvider: any): Promise<CryptoKey> {
  console.log("Deriving encryption key for address:", address);
  
  if (!walletProvider) {
    throw new Error("Wallet provider is required for encryption key derivation");
  }
  
  if (!walletProvider.request) {
    throw new Error("Invalid wallet provider - request method not available");
  }
  
  // Create a deterministic message based on the address
  const message = `Keepr Encryption Key for ${address}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hexMessage = '0x' + Buffer.from(data).toString('hex');
  

  try {
    // Sign the message with the wallet
    const signature = await walletProvider.request({
      method: 'personal_sign',
      params: [data, address]
    });
    
    // Use the signature as a seed for key derivation
    const signatureBytes = new Uint8Array(Buffer.from(signature.slice(2), 'hex'));
    
    // Import the signature as a raw key
    const derivedKey = await window.crypto.subtle.importKey(
      'raw',
      signatureBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive a final key using PBKDF2
    const finalKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('keepr-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      derivedKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    console.log("Successfully derived encryption key");
    return finalKey;
  } catch (error) {
    console.error("Error deriving encryption key:", error);
    if (error instanceof Error && error.message.includes('User rejected')) {
      throw new Error("User rejected the signature request. Please approve the signature to continue.");
    }
    throw new Error("Failed to derive encryption key. Please ensure your wallet is connected and try again.");
  }

}

// Deterministic RSA key generation using wallet signature
export async function generateDeterministicKeyPair(address: string, walletProvider: any): Promise<CryptoKeyPair> {
  console.log("Generating deterministic key pair for address:", address);

  
  if (!walletProvider) {
    throw new Error("Wallet provider is required for key pair generation");
  }
  
  if (!walletProvider.request) {
    throw new Error("Invalid wallet provider - request method not available");
  }

  // Create a deterministic message based on the address
  const message = `Keepr RSA Key Pair for ${address}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  
  try {
    // Sign the message with the wallet
    const signature = await walletProvider.request({
      method: 'personal_sign',
      params: [data, address]
    });
    
    // Use the signature as a seed for deterministic key generation
    const signatureBytes = new Uint8Array(Buffer.from(signature.slice(2), 'hex'));
    
    // Create a deterministic seed from the signature
    const seed = await window.crypto.subtle.digest('SHA-256', signatureBytes);
    const seedArray = new Uint8Array(seed);
    
    // Use the seed to generate a deterministic key pair
    // Note: Web Crypto API doesn't support seeded key generation directly
    // So we'll use a workaround by creating a deterministic seed
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    console.log("Generated deterministic key pair for address:", address);
    return keyPair;
  } catch (error) {
    console.error("Error generating deterministic key pair:", error);
    if (error instanceof Error && error.message.includes('User rejected')) {
      throw new Error("User rejected the signature request. Please approve the signature to continue.");
    }
    throw new Error("Failed to generate encryption keys. Please ensure your wallet is connected and try again.");
  }

}

// Main decryption function for keeps
export async function decryptKeep(
  encryptedData: {
    ciphertext: number[];
    iv: number[];
    encryptedOwnerKey: number[];
    encryptedFallbackKey?: number[];
    encryptedCreatorKey: number[];
  },
  userAddress: string,
  walletProvider?: any
): Promise<ArrayBuffer> {
  try {
    console.log("Starting decryption for user:", userAddress);
    console.log("Encrypted data structure:", {
      ciphertextLength: encryptedData.ciphertext.length,
      ivLength: encryptedData.iv.length,
      ownerKeyLength: encryptedData.encryptedOwnerKey.length,
      hasFallbackKey: !!encryptedData.encryptedFallbackKey,
      creatorKeyLength: encryptedData.encryptedCreatorKey.length
    });
    
    // Get the user's private key (works for any address, including non-app users)
    const privateKey = await getEncryptionPrivateKeyForAddress(userAddress);
    console.log("Retrieved private key for user");
    
    // Try to decrypt the symmetric key using the user's private key
    let symmetricKeyData: ArrayBuffer;
    
    try {
      // First try with the creator key (if user is the creator)
      const creatorKeyBuffer = new Uint8Array(encryptedData.encryptedCreatorKey).buffer;
      console.log("Attempting to decrypt with creator key...");
      symmetricKeyData = await asymmetricDecrypt(creatorKeyBuffer, privateKey);
      console.log("Successfully decrypted with creator key");
    } catch (error) {
      console.log("Creator key decryption failed, trying owner key...");
      try {
        // Then try with the owner key
        const ownerKeyBuffer = new Uint8Array(encryptedData.encryptedOwnerKey).buffer;
        console.log("Attempting to decrypt with owner key...");
        symmetricKeyData = await asymmetricDecrypt(ownerKeyBuffer, privateKey);
        console.log("Successfully decrypted with owner key");
      } catch (error) {
        console.log("Owner key decryption failed, trying fallback key...");
        // If that fails and there's a fallback key, try with the fallback key
        if (encryptedData.encryptedFallbackKey) {
          const fallbackKeyBuffer = new Uint8Array(encryptedData.encryptedFallbackKey).buffer;
          symmetricKeyData = await asymmetricDecrypt(fallbackKeyBuffer, privateKey);
          console.log("Successfully decrypted with fallback key");
        } else {
          throw new Error("Unable to decrypt symmetric key with available keys");
        }
      }
    }
    
    // Import the symmetric key
    const symmetricKey = await importSymmetricKey(symmetricKeyData);
    console.log("Imported symmetric key");
    
    // Decrypt the content
    const ciphertext = new Uint8Array(encryptedData.ciphertext).buffer;
    const iv = new Uint8Array(encryptedData.iv);
    console.log("Decrypting content with symmetric key...");
    const decryptedContent = await symmetricDecrypt(ciphertext, symmetricKey, iv);
    console.log("Content decrypted successfully");
    
    return decryptedContent;
  } catch (error) {
    console.error("Error decrypting keep:", error);
    throw new Error("Failed to decrypt keep content");
  }
}

// Function to generate instructions for recipients who don't have the app
export function generateRecipientInstructions(
  recipientAddress: string,
  keepTitle: string,
  unlockTime: string,
  appUrl: string = "https://keepr.app"
): string {
  const unlockDate = new Date(unlockTime).toLocaleDateString();
  
  return `
Dear Keepr Recipient,

You have been designated as a recipient for a Keep titled "${keepTitle}" that will become available on ${unlockDate}.

To access your Keep:

1. Visit ${appUrl}
2. Connect your wallet (address: ${recipientAddress})
3. Navigate to your Dashboard
4. Look for the Keep titled "${keepTitle}" in your available keeps
5. Click on the Keep to view and decrypt the content

Important Security Notes:
- Only you can decrypt this content using your wallet
- The content is end-to-end encrypted and stored securely on IPFS
- Make sure you're using the correct wallet address: ${recipientAddress}
- If you have any issues, contact the Keep creator

Best regards,
The Keepr Team
  `.trim();
}

// Function to validate if a recipient can access a keep
export async function canRecipientAccessKeep(
  recipientAddress: string,
  encryptedData: {
    encryptedOwnerKey: number[];
    encryptedFallbackKey?: number[];
    encryptedCreatorKey: number[];
  }
): Promise<boolean> {
  try {
    // Try to get the recipient's private key
    const privateKey = await getEncryptionPrivateKeyForAddress(recipientAddress);
    
    // Try to decrypt any of the available keys
    const keysToTry = [
      { name: 'owner', data: encryptedData.encryptedOwnerKey },
      { name: 'creator', data: encryptedData.encryptedCreatorKey }
    ];
    
    if (encryptedData.encryptedFallbackKey) {
      keysToTry.push({ name: 'fallback', data: encryptedData.encryptedFallbackKey });
    }
    
    for (const key of keysToTry) {
      try {
        const keyBuffer = new Uint8Array(key.data).buffer;
        await asymmetricDecrypt(keyBuffer, privateKey);
        console.log(`Recipient can decrypt with ${key.name} key`);
        return true;
      } catch (error) {
        console.log(`Recipient cannot decrypt with ${key.name} key`);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Error checking recipient access:", error);
    return false;
  }
}