import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import Web3Modal configuration
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// Web3Modal configuration for Lisk blockchain
const projectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

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

const metadata = {
  name: "Keepr",
  description: "Decentralized inheritance and secret-keeping protocol",
  url: "https://keepr.app",
  icons: ["/keepr-192.png"],
};

// Initialize Web3Modal before rendering the app
createWeb3Modal({
  ethersConfig: defaultConfig({
    metadata,
    enableEIP6963: true,
    enableInjected: true,
    enableCoinbase: true,
    rpcUrl: liskMainnet.rpcUrl,
    defaultChainId: liskMainnet.chainId,
  }),
  chains: [liskMainnet, liskSepolia],
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
});

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("SW registered:", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed:", registrationError);
      });
  });
}

// Initialize notification system
import { initializeNotificationSystem } from "./lib/notifications";
initializeNotificationSystem();

createRoot(document.getElementById("root")!).render(<App />);
