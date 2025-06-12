import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
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
  let upload;
  if (data instanceof File) {
    upload = pinata.upload.public.file(data);
    if (options?.name) upload = upload.name(options.name);
    if (options?.keyvalues) upload = upload.keyvalues(options.keyvalues);
  } else {
    upload = pinata.upload.public.json(data);
    if (options?.name) upload = upload.name(options.name);
    if (options?.keyvalues) upload = upload.keyvalues(options.keyvalues);
  }
  const result = await upload;
  console.log("result", result);  
  return result.cid;
};

// Download data from IPFS via Pinata gateway
export const downloadFromIPFS = async (cid: string): Promise<any> => {
  const url = `https://${PINATA_GATEWAY}/ipfs/${cid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from IPFS via Pinata gateway");
  // Try to parse as JSON, fallback to text
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
