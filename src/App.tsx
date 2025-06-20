import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Import Web3Modal provider
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";

// Pages
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CreateKeep from "./pages/CreateKeep";
import KeepDetails from "./pages/KeepDetails";
import KeepReveal from "./pages/KeepReveal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import FallbackClaim from "./pages/FallbackClaim";
import Documentation from "./pages/Documentation";

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

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isSplash = location.pathname === "/";

  // Footer links for fallback and documentation
  const FooterLinks = () => (
    <footer
      style={{
        width: "100%",
        textAlign: "center",
        padding: "1.5rem 0 1rem 0",
        position: "fixed",
        left: 0,
        bottom: 0,
        background: "transparent",
        zIndex: 10,
        fontSize: "0.92rem", // smaller font
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.85)",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          padding: "0.35rem 1.1rem",
          pointerEvents: "auto",
        }}
      >
        <a
          href="/fallback-claim"
          style={{
            marginRight: "1.2rem",
            color: "#222", // darker text
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Fallback Claim
        </a>
        <a
          href="/documentation"
          style={{
            color: "#222", // darker text
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Documentation
        </a>
      </div>
      {/* Style for PWA install prompt/button */}
      <style>
        {`
          .pwa-install-btn, .pwa-install, .pwa-install-button, .pwa-install-banner button {
            color: #222 !important;
            background: #fff !important;
            border: 1px solid #ddd !important;
            font-weight: 600 !important;
          }
        `}
      </style>
    </footer>
  );

  return (
    <>
      <Routes>
        {/* Main routes */}
        <Route
          path="/"
          element={
            <Onboarding
            // If your logo/icon is inside Onboarding, pass a prop or use context to handle click:
            // Example: <img src="logo.png" onClick={() => navigate('/dashboard')} />
            />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateKeep />} />
        <Route path="/keep/:id" element={<KeepDetails />} />
        <Route path="/keep/:id/reveal" element={<KeepReveal />} />
        <Route path="/keep/:id/edit" element={<CreateKeep />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fallback-claim" element={<FallbackClaim />} />
        <Route path="/documentation" element={<Documentation />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Show footer links on all pages except splash */}
      {!isSplash && <FooterLinks />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
