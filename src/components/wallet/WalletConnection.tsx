import {
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatAddress,
  formatBalance,
  isLiskNetwork,
  getNetworkName,
} from "@/lib/wallet";
import {
  Wallet,
  AlertTriangle,
  ChevronDown,
  Copy,
  ExternalLink,
  Power,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletConnection() {
  const { open } = useWeb3Modal();
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Get balance when wallet connects
  useEffect(() => {
    const getBalance = async () => {
      if (isConnected && walletProvider) {
        try {
          setIsLoading(true);
          const provider = new BrowserProvider(walletProvider);
          const signer = await provider.getSigner();
          const balance = await provider.getBalance(signer.address);
          setBalance((parseFloat(balance.toString()) / 1e18).toString());
        } catch (error) {
          console.error("Error getting balance:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    getBalance();
  }, [isConnected, walletProvider, address]);

  const copyAddress = async () => {
    if (address) {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement("textarea");
          textArea.value = address;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand("copy");
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (error) {
            console.error("Fallback copy failed:", error);
          }

          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
  };

  const refreshBalance = async () => {
    if (isConnected && walletProvider) {
      setIsLoading(true);
      try {
        const provider = new BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(signer.address);
        setBalance((parseFloat(balance.toString()) / 1e18).toString());
      } catch (error) {
        console.error("Error refreshing balance:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isConnected) {
    return (
      <Button
        onClick={() => open()}
        className="btn-native w-auto mx-auto flex items-center justify-center gap-3 text-base font-semibold"
        size="lg"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </Button>
    );
  }

  const isCorrectNetwork = chainId ? isLiskNetwork(chainId) : false;

  return (
    <div className="w-11/12 mx-auto space-y-1 mt-1">
      {/* Network Status Alert */}
      {!isCorrectNetwork && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-800 text-sm">
                Wrong Network
              </p>
              <p className="text-red-600 text-xs">
                Please switch to Lisk network
              </p>
            </div>
            <Button
              onClick={() => open({ view: "Networks" })}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 h-8"
            >
              Switch
            </Button>
          </div>
        </div>
      )}

      {/* Connected Wallet Card */}
      <div className="card-native p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-touch" />
            </div>
            <div>
              <p className="font-semibold text-forest-deep text-sm">
                Wallet Connected
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-muted-foreground">Active</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="touch-target hover:bg-forest-deep rounded-xl bg-forest-deep/10 hover:text-white p-2"
              >
                <ChevronDown className="w-5 h-5 text-forest-deep hover:text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 card-native border-none shadow-2xl"
            >
              <DropdownMenuLabel className="text-forest-deep">
                Wallet Details
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="p-3 space-y-1">
                {/* Address */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Address:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-mist-green px-2 py-1 rounded-lg font-mono">
                      {formatAddress(address || "")}
                    </code>
                    <Button
                      onClick={copyAddress}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-forest-deep/5"
                    >
                      {copied ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Balance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">Balance:</p>
                    <Button
                      onClick={refreshBalance}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-forest-deep/5"
                      disabled={isLoading}
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-forest-deep">
                      {formatBalance(balance)} ETH
                    </span>
                    {isLoading && (
                      <div className="w-3 h-3 border border-forest-deep/20 border-t-forest-deep rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>

                {/* Network */}
                {chainId && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Network:
                    </p>
                    <Badge
                      className={`${
                        isCorrectNetwork
                          ? "bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}
                    >
                      {getNetworkName(chainId)}
                    </Badge>
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => open({ view: "Account" })}
                className="cursor-pointer rounded-xl"
              >
                <Wallet className="w-4 h-4 mr-3" />
                Account Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => open({ view: "Networks" })}
                className="cursor-pointer rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                Switch Network
              </DropdownMenuItem>

              {address && (
                <DropdownMenuItem
                  onClick={() =>
                    window.open(
                      `https://blockscout.lisk.com/address/${address}`,
                      "_blank",
                    )
                  }
                  className="cursor-pointer rounded-xl"
                >
                  <ExternalLink className="w-4 h-4 mr-3" />
                  View on Explorer
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => open()}
                className="cursor-pointer text-destructive focus:text-destructive rounded-xl bg-red-100 font-bold"
              >
                <Power className="w-4 h-4 mr-3" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/60 backdrop-blur-md rounded-xl p-3">
            <p className="text-muted-foreground text-xs mb-1">Address</p>
            <p className="font-mono text-forest-deep text-lg font-semibold">
              {formatAddress(address || "")}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-md rounded-xl p-3">
            <p className="text-muted-foreground text-xs mb-1">Balance</p>
            <p className="font-semibold text-lg text-forest-deep">
              {formatBalance(balance)} ETH
            </p>
          </div>
        </div>

        {/* Network Badge */}
        {chainId && (
          <div className="mt-1 flex justify-center">
            <Badge
              className={`${
                isCorrectNetwork
                  ? "bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20 hover:text-white"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
              }`}
            >
              {getNetworkName(chainId)}
            </Badge>
          </div>
        )}
      </div>
      
    </div>
  );
}
