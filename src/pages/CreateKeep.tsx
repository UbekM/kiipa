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
  getEncryptionPublicKey,
  asymmetricEncrypt,
} from "@/lib/encryption";
import { uploadToIPFS } from "@/lib/wallet";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";

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

export default function CreateKeep() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address } = useWeb3ModalAccount();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [keepData, setKeepData] = useState({
    title: "",
    description: "",
    type: "secret",
    content: "",
    recipient: "",
    fallbackRecipient: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate content
      if (!keepData.content && !keepData.file) {
        throw new Error("Please provide either text content or upload a file");
      }

      // 1. Prepare content as ArrayBuffer
      let contentBuffer: ArrayBuffer;
      if (keepData.file) {
        contentBuffer = await keepData.file.arrayBuffer();
      } else {
        contentBuffer = new TextEncoder().encode(keepData.content);
      }

      // 2. Generate symmetric key
      const symmetricKey = await generateSymmetricKey();

      // 3. Encrypt content with symmetric key
      const { ciphertext, iv } = await symmetricEncrypt(
        contentBuffer,
        symmetricKey,
      );

      // 4. Get public keys for owner and fallback
      const ownerPublicKey = await getEncryptionPublicKey(keepData.recipient);
      const fallbackPublicKey = keepData.fallbackRecipient
        ? await getEncryptionPublicKey(keepData.fallbackRecipient)
        : null;

      // 5. Export and encrypt symmetric key for both
      const exportedKey = new Uint8Array(
        await exportSymmetricKey(symmetricKey),
      );
      const encryptedOwnerKey = asymmetricEncrypt(exportedKey, ownerPublicKey);
      const encryptedFallbackKey = fallbackPublicKey
        ? asymmetricEncrypt(exportedKey, fallbackPublicKey)
        : null;

      // 6. Upload encrypted content to IPFS
      const ipfsPayload = {
        ciphertext: Array.from(new Uint8Array(ciphertext)),
        iv: Array.from(iv),
        encryptedOwnerKey,
        encryptedFallbackKey,
        meta: {
          title: keepData.title,
          description: keepData.description,
          type: keepData.type,
        },
      };

      const ipfsHash = await uploadToIPFS(ipfsPayload, {
        name: keepData.title,
        keyvalues: {
          recipient: keepData.recipient,
          creator: address,
          ...(keepData.fallbackRecipient
            ? { fallback: keepData.fallbackRecipient }
            : {}),
        },
      });

      toast({
        title: "Keep Created",
        description: "Your Keep was created and encrypted successfully",
      });
      navigate("/dashboard");
    } catch (error) {
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
    <div className="min-h-screen bg-white">
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
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="mobile-padding mobile-section">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card className="border-forest-deep/10 mb-6">
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
                    Unlock Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={keepData.unlockTime}
                    onChange={(e) =>
                      setKeepData({ ...keepData, unlockTime: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
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
            <Button
              type="submit"
              className="btn-keepr flex-1"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Keep"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-forest-deep/20"
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
