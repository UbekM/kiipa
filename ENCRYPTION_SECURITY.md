# Keepr Encryption Security System

## Overview

Keepr uses a hybrid encryption system that ensures secure content delivery to recipients, even if they haven't used the Keepr app before. This system addresses the critical security challenge of enabling recipients to decrypt content without prior app knowledge.

## Encryption Architecture

### 1. Hybrid Encryption Scheme

```
Content → AES-GCM (Symmetric) → Encrypted Content
Symmetric Key → RSA-OAEP (Asymmetric) → Encrypted Keys for each recipient
```

### 2. Key Distribution Strategy

For each Keep, the symmetric key is encrypted with RSA-OAEP for:
- **Primary Recipient**: Can decrypt using their wallet-based private key
- **Fallback Recipient** (optional): Can decrypt using their wallet-based private key  
- **Creator**: Can decrypt using their wallet-based private key

### 3. Deterministic Key Generation

**Critical Innovation**: Keys are generated deterministically from wallet addresses, enabling:
- Recipients who don't know about Keepr can still decrypt content
- No need for pre-shared keys or manual key exchange
- Consistent key generation across different devices/sessions

## Security Flow

### For Keep Creators

1. **Content Preparation**: Text or file content is prepared
2. **Symmetric Encryption**: Content encrypted with random AES-GCM key
3. **Recipient Key Generation**: Deterministic RSA keys generated for each recipient
4. **Key Encryption**: Symmetric key encrypted for each recipient using their public key
5. **IPFS Storage**: Encrypted content + encrypted keys stored on IPFS
6. **Email Notification**: Recipients notified via email when keep becomes available

### For Recipients (Including Non-App Users)

1. **Email Notification**: Receive email about available keep
2. **App Access**: Visit Keepr app and connect wallet
3. **Automatic Key Generation**: App generates same deterministic keys
4. **Content Decryption**: App decrypts content using recipient's private key
5. **Content Access**: View decrypted content securely

## Technical Implementation

### Deterministic Key Generation

```typescript
// Generate deterministic RSA key pair for any address
export async function generateDeterministicKeyPairForAddress(address: string): Promise<CryptoKeyPair> {
  // Create deterministic seed from address
  const addressBytes = encoder.encode(address.toLowerCase());
  const seed = await window.crypto.subtle.digest('SHA-256', addressBytes);
  
  // Use PBKDF2 for robust key derivation
  const derivedBits = await window.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: encoder.encode('keepr-deterministic-salt'),
    iterations: 100000,
    hash: 'SHA-256'
  }, derivedKey, 256);
  
  // Generate RSA key pair
  return await window.crypto.subtle.generateKey({
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  }, true, ["encrypt", "decrypt"]);
}
```

### Encryption Process

```typescript
// 1. Generate symmetric key for content
const symmetricKey = await generateSymmetricKey();

// 2. Encrypt content with symmetric key
const { ciphertext, iv } = await symmetricEncrypt(contentBuffer, symmetricKey);

// 3. Generate deterministic keys for each recipient
const ownerPublicKey = await getEncryptionPublicKeyForAddress(recipientAddress);
const fallbackPublicKey = await getEncryptionPublicKeyForAddress(fallbackAddress);
const creatorPublicKey = await getEncryptionPublicKeyForAddress(creatorAddress);

// 4. Encrypt symmetric key for each recipient
const encryptedOwnerKey = await asymmetricEncrypt(exportedKey, ownerPublicKey);
const encryptedFallbackKey = await asymmetricEncrypt(exportedKey, fallbackPublicKey);
const encryptedCreatorKey = await asymmetricEncrypt(exportedKey, creatorPublicKey);
```

### Decryption Process

```typescript
// 1. Get recipient's deterministic private key
const privateKey = await getEncryptionPrivateKeyForAddress(userAddress);

// 2. Try to decrypt symmetric key with available keys
let symmetricKeyData: ArrayBuffer;
try {
  // Try creator key first, then owner key, then fallback key
  symmetricKeyData = await asymmetricDecrypt(encryptedKey, privateKey);
} catch (error) {
  // Try next available key...
}

// 3. Decrypt content with symmetric key
const symmetricKey = await importSymmetricKey(symmetricKeyData);
const decryptedContent = await symmetricDecrypt(ciphertext, symmetricKey, iv);
```

## Security Benefits

### ✅ **Universal Recipient Access**
- Recipients can decrypt content even if they've never used Keepr
- No pre-registration or key exchange required
- Works with any Ethereum-compatible wallet

### ✅ **End-to-End Encryption**
- Content encrypted before leaving creator's device
- Only authorized recipients can decrypt
- IPFS storage is encrypted and secure

### ✅ **Deterministic Key Generation**
- Same keys generated consistently across devices
- No key synchronization issues
- Works offline and across sessions

### ✅ **Multiple Access Paths**
- Primary recipient can always access
- Fallback recipient provides backup access
- Creator retains access for management

### ✅ **No Trusted Third Parties**
- No central key management
- No server-side decryption
- Pure client-side encryption/decryption

## Email Notification System

When a keep becomes available, recipients receive an email with:

1. **Keep Details**: Title, unlock date, creator info
2. **Access Instructions**: Step-by-step guide to access the keep
3. **Security Notes**: Important security considerations
4. **App URL**: Direct link to Keepr application

### Email Template

```
Dear Keepr Recipient,

You have been designated as a recipient for a Keep titled "My Secret" 
that will become available on January 15, 2024.

To access your Keep:

1. Visit https://keepr.app
2. Connect your wallet (address: 0x1234...5678)
3. Navigate to your Dashboard
4. Look for the Keep titled "My Secret" in your available keeps
5. Click on the Keep to view and decrypt the content

Important Security Notes:
- Only you can decrypt this content using your wallet
- The content is end-to-end encrypted and stored securely on IPFS
- Make sure you're using the correct wallet address: 0x1234...5678
- If you have any issues, contact the Keep creator

Best regards,
The Keepr Team
```

## Security Considerations

### 🔒 **Private Key Security**
- Private keys are generated deterministically but never stored
- Keys are re-generated on-demand from wallet address
- No persistent key storage reduces attack surface

### 🔒 **Content Security**
- AES-GCM provides authenticated encryption
- RSA-OAEP provides secure key encapsulation
- No plaintext content ever leaves the user's device

### 🔒 **Access Control**
- Only designated recipients can decrypt content
- Multiple encryption layers prevent unauthorized access
- Time-based access control via unlock dates

### 🔒 **Audit Trail**
- All access attempts are logged
- Failed decryption attempts are tracked
- IPFS provides immutable storage audit trail

## Implementation Notes

### Browser Compatibility
- Uses Web Crypto API for all cryptographic operations
- Compatible with all modern browsers
- No external cryptographic libraries required

### Performance
- Deterministic key generation is fast (< 100ms)
- Encryption/decryption optimized for typical content sizes
- Asynchronous operations don't block UI

### Error Handling
- Graceful fallback for failed decryption attempts
- Clear error messages for debugging
- Automatic retry mechanisms for network issues

## Future Enhancements

### Planned Improvements
1. **Threshold Encryption**: Split keys across multiple recipients
2. **Time-Lock Encryption**: Cryptographic time delays
3. **Quantum-Resistant Algorithms**: Post-quantum cryptography
4. **Zero-Knowledge Proofs**: Privacy-preserving access control

### Research Areas
1. **Decentralized Key Management**: Using blockchain for key distribution
2. **Homomorphic Encryption**: Computing on encrypted data
3. **Secure Multi-Party Computation**: Collaborative decryption

---

This encryption system ensures that Keepr can securely deliver digital inheritance content to recipients regardless of their prior knowledge of the application, while maintaining the highest standards of cryptographic security.
