import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import { useWeb3ModalProvider } from '@web3modal/ethers/react';
import { PinataSDK } from "pinata";

// Lisk blockchain configuration
const liskMainnet = {
  chainId: 1135,
  name: "Lisk",
  currency: "ETH",
  explorerUrl: "https://blockscout.lisk.com",
  rpcUrl: "https://rpc.api.lisk.com",
};

const liskSepolia = {
  chainId: 4202,
  name: "Lisk Sepolia Testnet",
  currency: "ETH",
  explorerUrl: "https://sepolia-blockscout.lisk.com",
  rpcUrl: "https://rpc.sepolia-api.lisk.com",
};

// Web3Modal configuration
const metadata = {
  name: "Keepr",
  description: "Decentralized inheritance and secret-keeping protocol",
  url: "https://keepr.app",
  icons: ["/keepr-192.png"],
};

// Create modal with Lisk network support
export const web3Modal = createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: liskMainnet.rpcUrl,
    defaultChainId: liskMainnet.chainId,
  }),
  chains: [liskMainnet, liskSepolia],
  projectId: process.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  enableAnalytics: true,
  enableOnramp: true,
});

// Wallet connection state management
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
};

// Utility functions for wallet operations
export const formatAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatBalance = (balance: string | null): string => {
  if (!balance) return "0.00";
  const num = parseFloat(balance);
  if (num < 0.01) return "< 0.01";
  return num.toFixed(4);
};

export const isLiskNetwork = (chainId: number): boolean => {
  return chainId === 1135 || chainId === 4202;
};

export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case 1135:
      return "Lisk Mainnet";
    case 4202:
      return "Lisk Sepolia";
    default:
      return "Unknown Network";
  }
};

// Contract addresses for Keepr protocol
export const KEEPR_CONTRACTS = {
  [liskMainnet.chainId]: {
    keepr: "0x...", // To be deployed
    keeper: "0x...",
  },
  [liskSepolia.chainId]: {
    keepr: "0x...", // To be deployed
    keeper: "0x...",
  },
} as const;

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY,
});

// Upload data to IPFS via Pinata (supports JSON or File)
export const uploadToIPFS = async (
  data: any,
  options?: { name?: string; keyvalues?: Record<string, string> }
): Promise<string> => {
  try {
    let result;
    
    if (data instanceof File) {
      // For files, use the file upload method with metadata
      result = await pinata.upload.public
        .file(data)
        .name(options?.name || 'keep')
        .keyvalues({
          ...options?.keyvalues,
          status: 'active' // Always set an initial status
        });
    } else {
      // For JSON data, use the JSON upload method with metadata
      result = await pinata.upload.public
        .json(data)
        .name(options?.name || 'keep')
        .keyvalues({
          ...options?.keyvalues,
          status: 'active' // Always set an initial status
        });
    }
    
    console.log("Pinata upload result:", result);
    return result.cid;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload to IPFS");
  }
};

// Download data from IPFS via Pinata gateway
export const downloadFromIPFS = async (cid: string): Promise<any> => {
  try {
    // Use the SDK's gateway method for better reliability
    const data = await pinata.gateways.public.get(cid);
    console.log("IPFS data retrieved:", data);
    return data;
  } catch (error) {
    console.error("Error downloading from IPFS:", error);
    // Fallback to direct gateway URL
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from IPFS via Pinata gateway");
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
};

// List files from Pinata using the SDK
export const listFiles = async (filters?: {
  name?: string;
  keyvalues?: Record<string, string>;
  status?: string;
}): Promise<any[]> => {
  try {
    // Use the raw API approach as shown in the documentation
    const response = await fetch("https://api.pinata.cloud/data/pinList", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PINATA_JWT}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch files from Pinata');
    }

    const data = await response.json();
    console.log("Pinata files list:", data);
    return data.rows || [];
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error("Failed to list files from Pinata");
  }
};

export const isNetworkSupported = async (): Promise<boolean> => {
  try {
    const { walletProvider } = useWeb3ModalProvider();
    if (!walletProvider) return false;
    
    const chainId = await walletProvider.request({ method: 'eth_chainId' });
    return isLiskNetwork(parseInt(chainId, 16));
  } catch (error) {
    console.error("Error checking network:", error);
    return false;
  }
};

export const switchToSupportedNetwork = async (): Promise<void> => {
  try {
    const { walletProvider } = useWeb3ModalProvider();
    if (!walletProvider) throw new Error("No provider available");

    await walletProvider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: `0x${liskMainnet.chainId.toString(16)}`,
        chainName: liskMainnet.name,
        nativeCurrency: {
          name: liskMainnet.currency,
          symbol: liskMainnet.currency,
          decimals: 18
        },
        rpcUrls: [liskMainnet.rpcUrl],
        blockExplorerUrls: [liskMainnet.explorerUrl]
      }]
    });

    await walletProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${liskMainnet.chainId.toString(16)}` }]
    });
  } catch (error) {
    console.error("Error switching network:", error);
    throw new Error("Failed to switch to supported network");
  }
};
