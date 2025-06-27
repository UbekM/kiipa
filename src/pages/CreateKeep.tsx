import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Shield,
  Upload,
  File,
  X,
  FileText,
  Key,
  Heart,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  generateSymmetricKey,
  symmetricEncrypt,
  exportSymmetricKey,
  getEncryptionPublicKeyForAddress,
  asymmetricEncrypt,
  getEncryptionKeysForAddress,
} from "@/lib/encryption";
import { uploadToIPFS } from "@/lib/wallet";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { isNetworkSupported, switchToSupportedNetwork } from "@/lib/wallet";
import { isValidEmail } from "@/lib/email";
import { useKeeprContract } from "@/hooks/useKeeprContract";
import { ethers } from "ethers";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "secret":
      return Shield;
    case "document":
      return FileText;
    case "key":
      return Key;
    case "inheritance":
      return Heart;
    default:
      return Shield;
  }
};

// Helper function to format date constraints
const getDateConstraints = () => {
  const now = new Date();
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
  const maxDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days from now

  return {
    min: minDate.toISOString().slice(0, 16), // Format for datetime-local input
    max: maxDate.toISOString().slice(0, 16),
    minDate,
    maxDate,
  };
};

export default function CreateKeep() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const {
    createKeep,
    loading: contractLoading,
    isContractDeployed,
    contractService,
  } = useKeeprContract();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keepData, setKeepData] = useState({
    title: "",
    description: "",
    type: "secret",
    content: "",
    recipient: "",
    recipientEmail: "",
    fallbackRecipient: "",
    fallbackEmail: "",
    unlockTime: "",
    file: null as File | null,
    fileName: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "File size must be less than 50MB",
        });
        return;
      }
      setKeepData((prev) => ({
        ...prev,
        file,
        fileName: file.name,
      }));
    }
  };

  const removeFile = () => {
    setKeepData((prev) => ({
      ...prev,
      file: null,
      fileName: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to refresh balance
  const refreshBalance = async () => {
    if (address && walletProvider) {
      setBalanceLoading(true);
      try {
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(signer.address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error refreshing balance:", error);
        setBalance(null);
      } finally {
        setBalanceLoading(false);
      }
    }
  };

  // Load balance when wallet connects
  React.useEffect(() => {
    refreshBalance();
  }, [address, walletProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate wallet connection
      if (!address) {
        throw new Error("Please connect your wallet first");
      }

      if (!walletProvider) {
        throw new Error(
          "Wallet provider not available. Please reconnect your wallet.",
        );
      }

      // Check if contract is deployed on current network
      if (!isContractDeployed) {
        toast({
          variant: "destructive",
          title: "Smart Contract Not Deployed",
          description:
            "The Keepr smart contract is not deployed on this network. Please switch to a supported network.",
        });
        return;
      }

      // Check if user is on a supported network
      const isSupported = await isNetworkSupported(walletProvider);
      if (!isSupported) {
        toast({
          variant: "destructive",
          title: "Unsupported Network",
          description:
            "Please switch to Lisk Mainnet or Sepolia to create keeps.",
        });
        try {
          await switchToSupportedNetwork(walletProvider);
          toast({
            title: "Network Switched",
            description:
              "Successfully switched to Lisk network. Please try creating your keep again.",
          });
        } catch (switchError) {
          toast({
            variant: "destructive",
            title: "Network Switch Failed",
            description:
              "Please manually switch to Lisk Mainnet or Sepolia in your wallet.",
          });
        }
        return;
      }

      // Validate content
      if (!keepData.content && !keepData.file) {
        throw new Error("Please provide either text content or upload a file");
      }

      console.log("Step 0: getEncryptionKeys");

      // Validate recipient address
      if (
        !keepData.recipient ||
        !/^0x[a-fA-F0-9]{40}$/.test(keepData.recipient)
      ) {
        throw new Error("Please enter a valid recipient wallet address");
      }

      // Prevent creator from creating keeps for themselves
      if (keepData.recipient.toLowerCase() === address.toLowerCase()) {
        throw new Error(
          "You cannot create a keep for yourself. Please enter a different recipient address.",
        );
      }

      // Validate fallback recipient address if provided
      if (
        keepData.fallbackRecipient &&
        !/^0x[a-fA-F0-9]{40}$/.test(keepData.fallbackRecipient)
      ) {
        throw new Error(
          "Please enter a valid fallback recipient wallet address",
        );
      }

      // Prevent creator from using themselves as fallback
      if (
        keepData.fallbackRecipient &&
        keepData.fallbackRecipient.toLowerCase() === address.toLowerCase()
      ) {
        throw new Error(
          "You cannot use yourself as a fallback recipient. Please enter a different fallback address.",
        );
      }

      // Validate recipient email if provided
      if (keepData.recipientEmail && !isValidEmail(keepData.recipientEmail)) {
        throw new Error("Please enter a valid recipient email address");
      }

      // Validate fallback email if provided
      if (keepData.fallbackEmail && !isValidEmail(keepData.fallbackEmail)) {
        throw new Error(
          "Please enter a valid fallback recipient email address",
        );
      }

      // Validate unlock time
      if (!keepData.unlockTime) {
        throw new Error("Please set an unlock time for your keep");
      }

      const unlockDate = new Date(keepData.unlockTime);
      const { minDate, maxDate } = getDateConstraints();

      if (unlockDate < minDate || unlockDate > maxDate) {
        throw new Error(
          "Unlock time must be between 1 day and 365 days from now",
        );
      }

      // 0. Ensure creator has encryption keys
      await getEncryptionKeysForAddress(address);

      console.log("Step 1: Prepare content");
      let contentBuffer: ArrayBuffer;
      if (keepData.file) {
        contentBuffer = await keepData.file.arrayBuffer();
      } else {
        contentBuffer = new TextEncoder().encode(keepData.content);
      }

      console.log("Step 2: generateSymmetricKey");
      const symmetricKey = await generateSymmetricKey();

      console.log("Step 3: symmetricEncrypt");
      const { ciphertext, iv } = await symmetricEncrypt(
        contentBuffer,
        symmetricKey,
      );

      console.log("Step 4: getEncryptionPublicKey (owner)");
      const ownerPublicKey = await getEncryptionPublicKeyForAddress(
        keepData.recipient,
      );

      console.log("Step 4: getEncryptionPublicKey (fallback)");
      const fallbackPublicKey = keepData.fallbackRecipient
        ? await getEncryptionPublicKeyForAddress(keepData.fallbackRecipient)
        : null;

      console.log("Step 4: getEncryptionPublicKey (creator)");
      const creatorPublicKey = await getEncryptionPublicKeyForAddress(address);

      console.log("Step 5: exportSymmetricKey");
      const exportedKey = new Uint8Array(
        await exportSymmetricKey(symmetricKey),
      );
      console.log("Step 5: asymmetricEncrypt (owner)");
      const encryptedOwnerKey = await asymmetricEncrypt(
        exportedKey,
        ownerPublicKey,
      );
      console.log("Step 5: asymmetricEncrypt (fallback)");
      const encryptedFallbackKey = fallbackPublicKey
        ? await asymmetricEncrypt(exportedKey, fallbackPublicKey)
        : null;
      console.log("Step 5: asymmetricEncrypt (creator)");
      const encryptedCreatorKey = await asymmetricEncrypt(
        exportedKey,
        creatorPublicKey,
      );

      console.log("Step 6: uploadToIPFS");
      const ipfsPayload = {
        ciphertext: Array.from(new Uint8Array(ciphertext)),
        iv: Array.from(iv),
        encryptedOwnerKey: Array.from(new Uint8Array(encryptedOwnerKey)),
        encryptedFallbackKey: encryptedFallbackKey
          ? Array.from(new Uint8Array(encryptedFallbackKey))
          : undefined,
        encryptedCreatorKey: Array.from(new Uint8Array(encryptedCreatorKey)),
        meta: {
          title: keepData.title,
          description: keepData.description,
          type: keepData.type,
          unlockTime: keepData.unlockTime,
        },
      };

      // Check if Pinata is configured
      if (!import.meta.env.VITE_PINATA_JWT) {
        toast({
          variant: "destructive",
          title: "IPFS Storage Not Configured",
          description:
            "Please configure IPFS storage to create keeps. Contact support for assistance.",
        });
        return;
      }

      const ipfsHash = await uploadToIPFS(ipfsPayload, {
        name: keepData.title,
        keyvalues: {
          recipient: keepData.recipient,
          recipientEmail: keepData.recipientEmail,
          creator: address,
          ...(keepData.fallbackRecipient
            ? {
                fallback: keepData.fallbackRecipient,
                fallbackEmail: keepData.fallbackEmail,
              }
            : {}),
          unlockTime: keepData.unlockTime,
        },
      });

      console.log("Step 7: Create keep on blockchain");

      // Get contract service for validation
      if (!contractService) {
        toast({
          variant: "destructive",
          title: "Contract Service Not Available",
          description:
            "Unable to connect to the smart contract. Please check your network connection and try again.",
        });
        return;
      }

      // Validate contract state before creating keep
      try {
        console.log("Validating contract state...");
        const configuration = await contractService.getConfiguration();
        console.log("Contract configuration:", configuration);

        const platformFee = await contractService.getPlatformFee();
        console.log("Platform fee:", platformFee);

        // Get current network and address
        const currentChainId = await walletProvider.request({
          method: "eth_chainId",
        });
        const signerAddress = await walletProvider.request({
          method: "eth_accounts",
        });
        console.log("Current chain ID:", currentChainId);
        console.log("Signer address:", signerAddress[0]);

        // Validate we're on the correct network
        const expectedChainId = "0x1066"; // Lisk Sepolia (4202 in decimal)
        if (currentChainId !== expectedChainId) {
          throw new Error(
            `Wrong network. Expected Lisk Sepolia (${expectedChainId}), got ${currentChainId}. Please switch to Lisk Sepolia testnet.`,
          );
        }

        // Get balance using the same method as WalletConnection for consistency
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        const balance = await provider.getBalance(signer.address);
        const balanceEth = parseFloat(ethers.formatEther(balance));
        const feeEth = parseFloat(platformFee);

        console.log("User balance (wei):", balance.toString());
        console.log("User balance (ETH):", balanceEth);
        console.log("Required fee (ETH):", feeEth);

        if (balanceEth < feeEth + 0.01) {
          // Add 0.01 ETH buffer for gas
          const shortfall = feeEth + 0.01 - balanceEth;
          throw new Error(
            `Insufficient balance. You need at least ${(feeEth + 0.01).toFixed(4)} ETH (${feeEth} ETH fee + gas). Current balance: ${balanceEth.toFixed(4)} ETH. Shortfall: ${shortfall.toFixed(4)} ETH. Please get testnet ETH from a faucet.`,
          );
        }
      } catch (validationError) {
        console.error("Contract validation failed:", validationError);
        toast({
          variant: "destructive",
          title: "Contract Validation Failed",
          description:
            validationError instanceof Error
              ? validationError.message
              : "Failed to validate contract state",
        });
        return;
      }

      // Test contract accessibility
      try {
        console.log("Testing contract accessibility...");
        const totalKeeps = await contractService.getTotalKeeps();
        console.log("Total keeps on contract:", totalKeeps);
      } catch (testError) {
        console.error("Contract accessibility test failed:", testError);
        toast({
          variant: "destructive",
          title: "Contract Not Accessible",
          description:
            "Unable to communicate with the smart contract. Please check your network connection and try again.",
        });
        return;
      }

      // Check if recipient has encryption keys
      try {
        console.log("Checking recipient encryption keys...");
        await getEncryptionKeysForAddress(keepData.recipient);
        console.log("Recipient has encryption keys");
      } catch (keyError) {
        console.warn("Recipient may not have encryption keys:", keyError);
        toast({
          variant: "default",
          title: "Recipient Setup Required",
          description:
            "The recipient may need to visit Keepr and connect their wallet to set up encryption keys before they can access this keep.",
        });
      }

      // Convert keep type to contract enum
      const keepTypeMap: { [key: string]: number } = {
        secret: 0,
        document: 1,
        key: 2,
        inheritance: 3,
      };

      // Create keep on blockchain
      const unlockTimestamp = Math.floor(
        new Date(keepData.unlockTime).getTime() / 1000,
      );

      console.log("Creating keep with parameters:", {
        recipient: keepData.recipient,
        fallbackRecipient:
          keepData.fallbackRecipient ||
          "0x0000000000000000000000000000000000000000",
        ipfsHash,
        unlockTimestamp,
        metadata: {
          title: keepData.title,
          description: keepData.description,
          keepType: keepTypeMap[keepData.type] || 0,
          recipientEmail: keepData.recipientEmail,
          fallbackEmail: keepData.fallbackEmail,
        },
      });

      try {
        const receipt = await createKeep(
          keepData.recipient,
          keepData.fallbackRecipient ||
            "0x0000000000000000000000000000000000000000",
          ipfsHash,
          unlockTimestamp,
          {
            title: keepData.title,
            description: keepData.description,
            keepType: keepTypeMap[keepData.type] || 0,
            recipientEmail: keepData.recipientEmail,
            fallbackEmail: keepData.fallbackEmail,
          },
        );

        // Schedule email notifications if emails are provided
        if (keepData.recipientEmail || keepData.fallbackEmail) {
          try {
            const { scheduleKeepNotification } = await import("@/lib/email");
            const notificationData = {
              keepTitle: keepData.title,
              keepDescription: keepData.description,
              unlockTime: keepData.unlockTime,
              creatorAddress: address,
              recipientAddress: keepData.recipient,
              recipientEmail: keepData.recipientEmail,
              fallbackAddress: keepData.fallbackRecipient,
              fallbackEmail: keepData.fallbackEmail,
              appUrl: window.location.origin,
            };

            await scheduleKeepNotification(
              notificationData,
              new Date(keepData.unlockTime),
            );
            console.log(
              "Email notifications scheduled for:",
              new Date(keepData.unlockTime),
            );
          } catch (error) {
            console.warn("Failed to schedule email notifications:", error);
            // Don't fail the keep creation if email scheduling fails
          }
        }

        // Show fallback recipient warning if they haven't used the app
        let fallbackWarning = null;
        if (keepData.fallbackRecipient) {
          fallbackWarning = `Note: Your fallback recipient (${keepData.fallbackRecipient.slice(0, 6)}...${keepData.fallbackRecipient.slice(-4)}) will need to visit Keepr and connect their wallet to access this keep. They will receive an email notification when the keep becomes available.`;
        }

        toast({
          title: "Keep Created Successfully",
          description: `Your Keep was created and stored on the blockchain! Transaction: ${receipt.hash}`,
        });

        if (fallbackWarning) {
          toast({
            variant: "default",
            title: "Fallback Recipient Setup",
            description: fallbackWarning,
          });
        }

        navigate("/dashboard");
      } catch (contractError) {
        console.error("Contract creation error:", contractError);

        // Provide specific error messages based on the error
        let errorMessage = "Failed to create Keep on blockchain";

        if (contractError instanceof Error) {
          if (
            contractError.message.includes("Cannot create keep for yourself")
          ) {
            errorMessage =
              "You cannot create a keep for yourself. Please use a different recipient address.";
          } else if (
            contractError.message.includes("Insufficient platform fee")
          ) {
            errorMessage =
              "Insufficient platform fee. Please ensure you have enough ETH to cover the transaction fee.";
          } else if (contractError.message.includes("Unlock time too soon")) {
            errorMessage =
              "Unlock time is too soon. Please set the unlock time to at least 1 day from now.";
          } else if (contractError.message.includes("Unlock time too far")) {
            errorMessage =
              "Unlock time is too far. Please set the unlock time to no more than 365 days from now.";
          } else if (
            contractError.message.includes("Invalid recipient address")
          ) {
            errorMessage =
              "Invalid recipient address. Please check the address and try again.";
          } else if (contractError.message.includes("missing revert data")) {
            errorMessage =
              "Transaction failed. This might be due to insufficient gas, network issues, or contract validation. Please check your wallet balance and try again.";
          } else if (
            contractError.message.includes("Internal JSON-RPC error")
          ) {
            errorMessage =
              "Network error. Please check your connection and try again. If the problem persists, try switching networks.";
          } else {
            errorMessage = contractError.message;
          }
        }

        toast({
          variant: "destructive",
          title: "Blockchain Transaction Failed",
          description: errorMessage,
        });

        // Don't navigate away, let user try again
        return;
      }
    } catch (error) {
      console.error("CreateKeep error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create Keep",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-white">
      {/* Header */}
      <header className="border-b border-forest-deep/5 bg-white/90 backdrop-blur-sm">
        <div className="mobile-padding py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-forest-deep"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-forest-deep" />
                <h1 className="text-lg font-bold text-forest-deep">
                  Create Keep
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      <WalletConnection />


      {/* Balance and Network Status */}
      {/* {address && (
        <div className="mobile-padding mb-6">
          <Card className="border-forest-deep/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-forest-deep/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-forest-deep" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-forest-deep">
                      Network Status
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {chainId === 4202
                        ? "Lisk Sepolia Testnet"
                        : chainId === 1135
                          ? "Lisk Mainnet"
                          : "Unknown Network"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-forest-deep">
                    Balance
                  </p>
                  <div className="flex items-end gap-2">
                    <p className="text-xs text-muted-foreground">
                      {balanceLoading ? (
                        <span className="animate-pulse">Loading...</span>
                      ) : balance ? (
                        `${parseFloat(balance).toFixed(4)} ETH`
                      ) : (
                        "Unknown"
                      )}
                    </p>
                    <Button
                      onClick={refreshBalance}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 hover:bg-forest-deep/5"
                      disabled={balanceLoading}
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${balanceLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )} */}

      <main className="mobile-padding mobile-section mt-14">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card className="border-forest-deep/10 mb-6 my-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-forest-deep">
                    Keep Details
                  </CardTitle>
                  <CardDescription>
                    Set up the basic information for your Keep
                  </CardDescription>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  {React.createElement(getTypeIcon(keepData.type), {
                    className: "w-6 h-6 text-forest-deep",
                  })}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-forest-deep">
                      Keep Type
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Choose the type of content you want to store
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: "secret", label: "Secret", icon: Shield },
                      { value: "document", label: "Document", icon: FileText },
                      { value: "key", label: "Key", icon: Key },
                      {
                        value: "inheritance",
                        label: "Inheritance",
                        icon: Heart,
                      },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setKeepData({ ...keepData, type: type.value })
                        }
                        className={cn(
                          "p-3 border rounded-xl transition-all",
                          keepData.type === type.value
                            ? "border-forest-deep bg-forest-deep/5"
                            : "border-forest-deep/20 hover:border-forest-deep/40",
                        )}
                      >
                        {React.createElement(type.icon, {
                          className: cn(
                            "w-5 h-5 mx-auto mb-2",
                            keepData.type === type.value
                              ? "text-forest-deep"
                              : "text-muted-foreground",
                          ),
                        })}
                        <p
                          className={cn(
                            "text-sm font-medium",
                            keepData.type === type.value
                              ? "text-forest-deep"
                              : "text-muted-foreground",
                          )}
                        >
                          {type.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Title
                  </label>
                  <Input
                    placeholder="Give your Keep a name"
                    value={keepData.title}
                    onChange={(e) =>
                      setKeepData({ ...keepData, title: e.target.value })
                    }
                    className="bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Description (Optional)
                  </label>
                  <Textarea
                    placeholder="Add a description"
                    value={keepData.description}
                    onChange={(e) =>
                      setKeepData({ ...keepData, description: e.target.value })
                    }
                    className="bg-white"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-forest-deep/10 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-forest-deep">
                    Keep Content
                  </CardTitle>
                  <CardDescription>
                    Add the content you want to secure
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20"
                >
                  End-to-end Encrypted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Text Content
                  </label>
                  <Textarea
                    placeholder="Enter the secret content to be encrypted"
                    value={keepData.content}
                    onChange={(e) =>
                      setKeepData({ ...keepData, content: e.target.value })
                    }
                    className="bg-white"
                    rows={5}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-forest-deep/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-mist-green px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    File Upload
                  </label>
                  <div className="border-2 border-dashed border-forest-deep/20 rounded-xl p-6 transition-colors hover:border-forest-deep/40">
                    {keepData.file ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-forest-deep/10 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-forest-deep" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-forest-deep">
                              {keepData.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(keepData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="mx-auto mb-2"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Supports any file type. Max size: 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
                🔒 Your content will be encrypted before being stored on IPFS,
                ensuring only authorized recipients can access it
              </p>
            </CardContent>
          </Card>

          <Card className="border-forest-deep/10 mb-6">
            <CardHeader>
              <CardTitle className="text-forest-deep">
                Recipients & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Primary Recipient
                  </label>
                  <Input
                    placeholder="Wallet address (0x...)"
                    value={keepData.recipient}
                    onChange={(e) =>
                      setKeepData({ ...keepData, recipient: e.target.value })
                    }
                    className="bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Recipient Email
                  </label>
                  <Input
                    placeholder="Recipient's email"
                    value={keepData.recipientEmail}
                    onChange={(e) =>
                      setKeepData({
                        ...keepData,
                        recipientEmail: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Fallback Recipient (Optional)
                  </label>
                  <Input
                    placeholder="Wallet address (0x...)"
                    value={keepData.fallbackRecipient}
                    onChange={(e) =>
                      setKeepData({
                        ...keepData,
                        fallbackRecipient: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Fallback Email (Optional)
                  </label>
                  <Input
                    placeholder="Fallback recipient's email"
                    value={keepData.fallbackEmail}
                    onChange={(e) =>
                      setKeepData({
                        ...keepData,
                        fallbackEmail: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Unlock Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={keepData.unlockTime}
                    onChange={(e) =>
                      setKeepData({ ...keepData, unlockTime: e.target.value })
                    }
                    min={getDateConstraints().min}
                    max={getDateConstraints().max}
                    required
                    className="bg-white"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recipients can claim the Keep after this time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    {" "}
                    {/* Tooltips require a wrapper on disabled elements */}
                    <Button
                      type="submit"
                      className="btn-keepr w-full"
                      disabled={loading || !walletProvider || !address}
                    >
                      {loading ? "Creating..." : "Create Keep"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {!walletProvider && address && (
                  <TooltipContent>
                    <p>
                      Waiting for wallet provider... please wait or reconnect.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-forest-deep/20 mb-14"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
