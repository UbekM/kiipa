// Keepr Smart Contract Integration
import { ethers } from 'ethers';

// Contract ABI - This would be generated from the compiled contract
export const KEEPR_ABI = [
  // Events
  "event KeepCreated(uint256 indexed keepId, address indexed creator, address indexed recipient, string ipfsHash, uint256 unlockTime, uint8 keepType)",
  "event KeepClaimed(uint256 indexed keepId, address indexed recipient, uint256 claimedAt)",
  "event KeepCancelled(uint256 indexed keepId, address indexed creator, uint256 cancelledAt)",
  "event FallbackActivated(uint256 indexed keepId, address indexed fallbackRecipient, uint256 activatedAt)",
  "event RecipientChanged(uint256 indexed keepId, address indexed oldRecipient, address indexed newRecipient)",
  
  // Structs
  "struct Keep { uint256 id; address creator; address recipient; address fallbackRecipient; string ipfsHash; uint256 unlockTime; uint256 createdAt; uint8 status; uint8 keepType; string title; string description; }",
  "struct KeepMetadata { string title; string description; uint8 keepType; uint256 unlockTime; string recipientEmail; string fallbackEmail; }",
  
  // Enums
  "enum KeepStatus { Active, Claimed, Cancelled, Expired }",
  "enum KeepType { Secret, Document, Key, Inheritance }",
  
  // Functions
  "function createKeep(address recipient, address fallbackRecipient, string calldata ipfsHash, uint256 unlockTime, KeepMetadata calldata metadata) external payable",
  "function claimKeep(uint256 keepId) external",
  "function activateFallback(uint256 keepId) external",
  "function cancelKeep(uint256 keepId) external",
  "function changeRecipient(uint256 keepId, address newRecipient) external",
  "function getKeepsByCreator(address user) external view returns (uint256[] memory)",
  "function getKeepsByRecipient(address user) external view returns (uint256[] memory)",
  "function getKeep(uint256 keepId) external view returns (Keep memory)",
  "function canActivateFallback(uint256 keepId) external view returns (bool)",
  "function getTotalKeeps() external view returns (uint256)",
  "function minUnlockDelay() external view returns (uint256)",
  "function maxUnlockDelay() external view returns (uint256)",
  "function claimWindow() external view returns (uint256)",
  "function platformFee() external view returns (uint256)",
  "function pause() external",
  "function unpause() external",
  "function withdrawFees() external",
  "function emergencyCancelKeep(uint256 keepId) external"
];

// Contract addresses (to be updated after deployment)
export const KEEPR_CONTRACTS = {
  1135: { // Lisk Mainnet
    keepr: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
  },
  4202: { // Lisk Sepolia
    keepr: "0x0000000000000000000000000000000000000000", // TODO: Deploy and update
  },
  1337: { // Hardhat Local
    keepr: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default Hardhat address
  }
} as const;

// Contract interface
export interface KeeprContract {
  createKeep(
    recipient: string,
    fallbackRecipient: string,
    ipfsHash: string,
    unlockTime: number,
    metadata: {
      title: string;
      description: string;
      keepType: number;
      unlockTime: number;
      recipientEmail: string;
      fallbackEmail: string;
    },
    overrides?: { value?: string }
  ): Promise<ethers.ContractTransaction>;

  claimKeep(keepId: number): Promise<ethers.ContractTransaction>;
  activateFallback(keepId: number): Promise<ethers.ContractTransaction>;
  cancelKeep(keepId: number): Promise<ethers.ContractTransaction>;
  changeRecipient(keepId: number, newRecipient: string): Promise<ethers.ContractTransaction>;
  
  getKeepsByCreator(user: string): Promise<number[]>;
  getKeepsByRecipient(user: string): Promise<number[]>;
  getKeep(keepId: number): Promise<{
    id: number;
    creator: string;
    recipient: string;
    fallbackRecipient: string;
    ipfsHash: string;
    unlockTime: number;
    createdAt: number;
    status: number;
    keepType: number;
    title: string;
    description: string;
  }>;
  canActivateFallback(keepId: number): Promise<boolean>;
  getTotalKeeps(): Promise<number>;
  platformFee(): Promise<bigint>;
}

// Contract factory
export function createKeeprContract(
  address: string,
  signerOrProvider: ethers.Signer | ethers.Provider
): KeeprContract {
  return new ethers.Contract(address, KEEPR_ABI, signerOrProvider) as KeeprContract;
}

// Contract utilities
export class KeeprContractService {
  private contract: KeeprContract;
  private signer: ethers.Signer;

  constructor(contractAddress: string, signer: ethers.Signer) {
    this.contract = createKeeprContract(contractAddress, signer);
    this.signer = signer;
  }

  // Create a new keep
  async createKeep(
    recipient: string,
    fallbackRecipient: string,
    ipfsHash: string,
    unlockTime: number,
    metadata: {
      title: string;
      description: string;
      keepType: number;
      recipientEmail: string;
      fallbackEmail: string;
    }
  ): Promise<ethers.ContractTransaction> {
    const platformFee = await this.contract.platformFee();
    
    return this.contract.createKeep(
      recipient,
      fallbackRecipient,
      ipfsHash,
      unlockTime,
      {
        ...metadata,
        unlockTime
      },
      { value: platformFee }
    );
  }

  // Claim a keep
  async claimKeep(keepId: number): Promise<ethers.ContractTransaction> {
    return this.contract.claimKeep(keepId);
  }

  // Activate fallback access
  async activateFallback(keepId: number): Promise<ethers.ContractTransaction> {
    return this.contract.activateFallback(keepId);
  }

  // Cancel a keep
  async cancelKeep(keepId: number): Promise<ethers.ContractTransaction> {
    return this.contract.cancelKeep(keepId);
  }

  // Change recipient
  async changeRecipient(keepId: number, newRecipient: string): Promise<ethers.ContractTransaction> {
    return this.contract.changeRecipient(keepId, newRecipient);
  }

  // Get keeps by creator
  async getKeepsByCreator(user: string): Promise<number[]> {
    return this.contract.getKeepsByCreator(user);
  }

  // Get keeps by recipient
  async getKeepsByRecipient(user: string): Promise<number[]> {
    return this.contract.getKeepsByRecipient(user);
  }

  // Get keep details
  async getKeep(keepId: number) {
    return this.contract.getKeep(keepId);
  }

  // Check if fallback can be activated
  async canActivateFallback(keepId: number): Promise<boolean> {
    return this.contract.canActivateFallback(keepId);
  }

  // Get total keeps
  async getTotalKeeps(): Promise<number> {
    return this.contract.getTotalKeeps();
  }

  // Get platform fee
  async getPlatformFee(): Promise<string> {
    const fee = await this.contract.platformFee();
    return ethers.formatEther(fee);
  }

  // Get contract configuration
  async getConfiguration() {
    const [minDelay, maxDelay, claimWindow, platformFee] = await Promise.all([
      this.contract.minUnlockDelay(),
      this.contract.maxUnlockDelay(),
      this.contract.claimWindow(),
      this.contract.platformFee()
    ]);

    return {
      minUnlockDelay: Number(minDelay),
      maxUnlockDelay: Number(maxDelay),
      claimWindow: Number(claimWindow),
      platformFee: ethers.formatEther(platformFee)
    };
  }
}

// Hook for using the contract
export function useKeeprContract(chainId?: number) {
  const getContractAddress = () => {
    if (!chainId) return null;
    return KEEPR_CONTRACTS[chainId as keyof typeof KEEPR_CONTRACTS]?.keepr || null;
  };

  const getContractService = (signer: ethers.Signer) => {
    const address = getContractAddress();
    if (!address) throw new Error("Contract not deployed on this network");
    return new KeeprContractService(address, signer);
  };

  return {
    getContractAddress,
    getContractService,
    isContractDeployed: !!getContractAddress()
  };
}

// Event parsing utilities
export function parseKeepCreatedEvent(log: ethers.Log) {
  const iface = new ethers.Interface(KEEPR_ABI);
  const parsed = iface.parseLog(log);
  
  return {
    keepId: parsed?.args[0],
    creator: parsed?.args[1],
    recipient: parsed?.args[2],
    ipfsHash: parsed?.args[3],
    unlockTime: parsed?.args[4],
    keepType: parsed?.args[5]
  };
}

export function parseKeepClaimedEvent(log: ethers.Log) {
  const iface = new ethers.Interface(KEEPR_ABI);
  const parsed = iface.parseLog(log);
  
  return {
    keepId: parsed?.args[0],
    recipient: parsed?.args[1],
    claimedAt: parsed?.args[2]
  };
}

// Keep status mapping
export const KEEP_STATUS = {
  0: "Active",
  1: "Claimed", 
  2: "Cancelled",
  3: "Expired"
} as const;

// Keep type mapping
export const KEEP_TYPE = {
  0: "Secret",
  1: "Document",
  2: "Key", 
  3: "Inheritance"
} as const;
