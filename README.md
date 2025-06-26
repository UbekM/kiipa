# 🔐 Keepr - Decentralized Digital Inheritance

**Secure your digital legacy with trustless, decentralized inheritance powered by blockchain technology.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🌟 Overview

Keepr is a revolutionary decentralized inheritance protocol that enables secure, trustless transfer of digital assets, secrets, and documents. Built on blockchain technology with end-to-end encryption, Keepr ensures your digital legacy is protected and accessible only to designated recipients.

### 🚀 Key Features

- **🔒 End-to-End Encryption** - Military-grade encryption before storage
- **🌐 Decentralized Storage** - Distributed across IPFS network
- **⚡ Smart Inheritance** - Automatic unlocking with inactivity detection
- **👥 Multi-Recipient Support** - Primary and fallback recipient options
- **📱 Universal Access** - Recipients can decrypt even without prior app knowledge
- **⏰ Time-Based Access** - Scheduled inheritance with unlock dates
- **🛡️ Trustless Security** - No central authority or trusted third parties

## 🔐 Revolutionary Encryption System

### Universal Recipient Access
Keepr's breakthrough encryption system allows recipients to decrypt content even if they've never used the app before. This solves the critical challenge of digital inheritance where recipients may not know about the platform until they receive notification.

### Hybrid Encryption Architecture
```
Content → AES-GCM (Symmetric) → Encrypted Content
Symmetric Key → RSA-OAEP (Asymmetric) → Encrypted Keys for each recipient
```

### Deterministic Key Generation
- Keys generated deterministically from wallet addresses
- No pre-registration or key exchange required
- Consistent key generation across devices and sessions
- Works with any Ethereum-compatible wallet

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Blockchain**: Ethereum/Lisk + WalletConnect
- **Storage**: IPFS (Pinata)
- **Encryption**: Web Crypto API (AES-GCM + RSA-OAEP)
- **State Management**: React Hooks + Context

### Security Features
- **Client-Side Encryption**: All encryption/decryption happens in the browser
- **Deterministic Keys**: Consistent key generation from wallet addresses
- **Multiple Access Paths**: Primary, fallback, and creator access
- **Time-Based Control**: Scheduled inheritance with unlock dates
- **Audit Trail**: Immutable storage with access tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet
- Pinata account for IPFS storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/UbekM/kiipa.git
   cd kiipa
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
   VITE_PINATA_JWT=your_pinata_jwt_token
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8081`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_WALLET_CONNECT_PROJECT_ID` | WalletConnect Cloud Project ID | Yes |
| `VITE_PINATA_JWT` | Pinata IPFS JWT token | Yes |

## 📖 Usage

### Creating a Keep

1. **Connect Wallet** - Use MetaMask or any Web3 wallet
2. **Create Keep** - Upload content (text or files up to 50MB)
3. **Set Recipients** - Designate primary and fallback recipients
4. **Configure Timing** - Set unlock date for inheritance
5. **Encrypt & Store** - Content is encrypted and stored on IPFS

### Accessing a Keep

1. **Receive Notification** - Email notification when keep becomes available
2. **Connect Wallet** - Use the same wallet address as designated recipient
3. **Access Dashboard** - View available keeps in your dashboard
4. **Decrypt Content** - Content is automatically decrypted using your keys

### For Recipients (Including Non-App Users)

Recipients receive an email with instructions:
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

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── wallet/         # Wallet connection components
│   └── keepr/          # Keep-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
│   ├── encryption.ts   # Encryption utilities
│   ├── wallet.ts       # Wallet utilities
│   └── utils.ts        # General utilities
├── pages/              # Page components
└── main.tsx           # Application entry point
```

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔒 Security

### Encryption Details
- **AES-GCM**: 256-bit symmetric encryption for content
- **RSA-OAEP**: 2048-bit asymmetric encryption for key distribution
- **PBKDF2**: Key derivation with 100,000 iterations
- **Deterministic Generation**: Keys derived from wallet addresses

### Security Considerations
- Private keys are generated deterministically but never stored
- All encryption/decryption happens client-side
- No plaintext content ever leaves the user's device
- IPFS provides immutable storage with audit trail

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [ENCRYPTION_SECURITY.md](ENCRYPTION_SECURITY.md)
- **Issues**: [GitHub Issues](https://github.com/UbekM/kiipa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/UbekM/kiipa/discussions)

## 🙏 Acknowledgments

- [WalletConnect](https://walletconnect.com/) for Web3 connectivity
- [Pinata](https://pinata.cloud/) for IPFS storage
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

**Keepr** - Securing digital legacies for the decentralized future. 🔐✨
