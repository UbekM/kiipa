# Solidity & Blockchain Functionality in Keepr

## Overview
Keepr is a decentralized inheritance and secret-keeping protocol. The core of its security and automation is a Solidity smart contract deployed on the Lisk EVM blockchain (and compatible networks). This contract manages the lifecycle of "keeps"—encrypted secrets or assets that are released to recipients (or fallback recipients) according to programmable rules.

## Smart Contract: `Keepr.sol`

### Key Responsibilities
- **Keep Creation**: Store metadata and IPFS hash for each keep, with recipient and fallback recipient addresses, unlock time, and type.
- **Access Control**: Only the designated recipient (or fallback recipient after a claim window) can claim a keep.
- **Fallback Logic**: If the primary recipient does not claim the keep within a set window after unlock, the fallback recipient can claim it.
- **Admin Controls**: The contract owner can pause the contract, update configuration, and withdraw platform fees.
- **Event Emission**: Emits events for all major actions (creation, claim, fallback, cancel, recipient change) for off-chain tracking and UI updates.

### Main Data Structure
```solidity
struct Keep {
    uint256 id;
    address creator;
    address recipient;
    address fallbackRecipient;
    string ipfsHash;
    uint256 unlockTime;
    uint256 createdAt;
    KeepStatus status;
    KeepType keepType;
    string title;
    string description;
}
```

### Key Functions
- `createKeep(...)`: Anyone can create a keep for another address, specifying unlock time, fallback, and metadata. The encrypted content is stored on IPFS, and only the hash is stored on-chain.
- `claimKeep(keepId)`: The recipient can claim the keep after the unlock time, marking it as claimed.
- `activateFallback(keepId)`: If the claim window passes and the keep is unclaimed, the fallback recipient can claim it.
- `cancelKeep(keepId)`: The creator can cancel a keep before it unlocks.
- `changeRecipient(keepId, newRecipient)`: The creator can change the recipient before unlock.
- Query functions: Get keeps by creator/recipient, get keep details, check fallback eligibility, etc.

### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks on state-changing functions.
- **Pausable**: Owner can pause the contract in emergencies.
- **Ownable**: Only the contract owner can perform admin actions.
- **Strict Validation**: All addresses, times, and states are validated.

## How the Blockchain Flow Connects the App

### 1. Keep Creation
- User fills out the form in the frontend, specifying content, recipient, fallback, unlock time, etc.
- Content is encrypted in the browser (never sent to the backend or blockchain in plaintext).
- Encrypted content and keys are uploaded to IPFS; the resulting hash is used as a pointer.
- The frontend calls `createKeep` on the smart contract, storing the IPFS hash and metadata on-chain.
- The contract emits a `KeepCreated` event, which the frontend can listen to for real-time updates.

### 2. Claiming a Keep
- When the unlock time passes, the recipient can claim the keep by calling `claimKeep`.
- The contract checks permissions and updates the keep status to `Claimed`.
- The frontend fetches the keep, downloads the encrypted content from IPFS, and decrypts it using the recipient's wallet-derived key.

### 3. Fallback Activation
- If the recipient does not claim the keep within the claim window, the fallback recipient can call `activateFallback`.
- The contract checks eligibility and updates the keep status.
- The fallback recipient can now decrypt the content using their wallet-derived key.

### 4. Admin and Emergency Controls
- The contract owner can pause the contract, update configuration (fees, time windows), and withdraw accumulated fees.
- Emergency functions allow for cancellation or pausing in case of bugs or attacks.

### 5. Event-Driven UI
- The frontend listens for contract events (using ethers.js) to update the UI in real time.
- All actions (create, claim, fallback, cancel) are reflected instantly for all users.

## Why This Flow is Secure and Decentralized
- **No Centralized Storage**: All sensitive content is encrypted and stored on IPFS; only hashes and metadata are on-chain.
- **No Trusted Third Parties**: Only the intended recipient (or fallback) can decrypt the content, using keys derived from their wallet.
- **Transparent and Auditable**: All actions are recorded on the blockchain and can be independently verified.
- **Automated Inheritance**: The fallback logic ensures that if the primary recipient is unavailable, the inheritance process continues automatically.
- **User Sovereignty**: Users control their own keys and data; the app cannot access or decrypt keeps.

## Summary
The Solidity smart contract is the backbone of Keepr, enforcing all rules and permissions in a trustless, transparent, and automated way. The frontend interacts with the contract for all critical actions, and the flow ensures that only the right people can access the right secrets, at the right time, with no central authority or single point of failure.
