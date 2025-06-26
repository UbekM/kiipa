import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Shield,
  Eye,
  Edit,
  Trash2,
  Download,
  EyeOff,
  Lock,
  AlertTriangle,
  User,
  Clock,
  FileText,
  Heart,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Keep } from "@/components/keepr/KeepCard";
import { downloadFromIPFS } from "@/lib/wallet";
import {
  decryptKeep,
  getEncryptionPrivateKeyForAddress,
} from "@/lib/encryption";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { LoadingState } from "@/components/LoadingState";

interface KeepData {
  ciphertext: number[];
  iv: number[];
  encryptedOwnerKey: number[];
  encryptedFallbackKey?: number[];
  encryptedCreatorKey: number[];
  meta: {
    title: string;
    description: string;
    type: string;
    unlockTime?: string;
  };
}

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

export default function KeepDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { address } = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();

  const [keepData, setKeepData] = useState<KeepData | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<ArrayBuffer | null>(
    null,
  );
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("details");

  useEffect(() => {
    if (!id) {
      setError("No keep ID provided");
      setLoading(false);
      return;
    }
    fetchKeepData();
  }, [id]);

  const fetchKeepData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching keep data for ID:", id);
      const data = await downloadFromIPFS(id!);
      console.log("Keep data received:", data);

      setKeepData(data);
    } catch (err) {
      console.error("Error fetching keep data:", err);
      setError("Failed to fetch keep data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewContent = async () => {
    if (!keepData || !address) return;

    try {
      setDecrypting(true);
      setError(null);

      console.log("Decrypting keep content...");

      // Check if user has encryption keys
      try {
        await getEncryptionPrivateKeyForAddress(address);
      } catch (keyError) {
        throw new Error(
          "You don't have encryption keys set up. Please create a keep first to generate your keys.",
        );
      }

      const decrypted = await decryptKeep(keepData, address);
      console.log("Content decrypted successfully");

      setDecryptedContent(decrypted);
      setShowContent(true);

      toast({
        title: "Content Revealed",
        description: "The keep content has been successfully decrypted",
      });
    } catch (err) {
      console.error("Error decrypting keep:", err);
      let errorMessage = "Failed to decrypt keep content.";

      if (err instanceof Error) {
        if (err.message.includes("Unable to decrypt symmetric key")) {
          errorMessage =
            "You don't have permission to access this keep. Only the recipient or fallback recipient can decrypt this content.";
        } else if (err.message.includes("Failed to decrypt keep content")) {
          errorMessage =
            "The keep content could not be decrypted. This may be due to corrupted data or missing encryption keys.";
        } else if (err.message.includes("encryption keys set up")) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      toast({
        variant: "destructive",
        title: "Decryption Failed",
        description: errorMessage,
      });
    } finally {
      setDecrypting(false);
    }
  };

  const handleDownload = () => {
    if (!decryptedContent || !keepData) return;

    try {
      // Determine if content is text or binary
      const textDecoder = new TextDecoder();
      let content: string | Blob;
      let filename: string;
      let mimeType: string;

      try {
        // Try to decode as text
        content = textDecoder.decode(decryptedContent);
        filename = `${keepData.meta?.title || "keep"}.txt`;
        mimeType = "text/plain";
      } catch {
        // If text decoding fails, treat as binary
        content = new Blob([decryptedContent]);
        filename = `${keepData.meta?.title || "keep"}.bin`;
        mimeType = "application/octet-stream";
      }

      // Create download link
      const blob =
        typeof content === "string"
          ? new Blob([content], { type: mimeType })
          : content;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "The keep content has been downloaded",
      });
    } catch (err) {
      console.error("Error downloading content:", err);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Unable to download the content",
      });
    }
  };

  const renderContent = () => {
    if (!decryptedContent) return null;

    try {
      // Try to decode as text first
      const textDecoder = new TextDecoder();
      const textContent = textDecoder.decode(decryptedContent);

      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-forest-deep/10">
            <h3 className="font-semibold text-forest-deep mb-2">
              Content Preview
            </h3>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {textContent}
              </pre>
            </div>
          </div>
          <Button onClick={handleDownload} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Content
          </Button>
        </div>
      );
    } catch {
      // If text decoding fails, show as binary
      return (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-forest-deep/10">
            <h3 className="font-semibold text-forest-deep mb-2">
              Binary Content
            </h3>
            <p className="text-sm text-muted-foreground">
              This keep contains binary data. Use the download button to save
              the file.
            </p>
          </div>
          <Button onClick={handleDownload} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mist-green via-white to-mist-green">
        <header className="border-b border-forest-deep/10 bg-white/50 backdrop-blur-sm">
          <div className="mobile-padding py-4">
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
                  Keep Details
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="mobile-padding mobile-section">
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-800">
                    Error Loading Keep
                  </h2>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!keepData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mist-green via-white to-mist-green">
        <header className="border-b border-forest-deep/10 bg-white/50 backdrop-blur-sm">
          <div className="mobile-padding py-4">
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
                  Keep Details
                </h1>
              </div>
            </div>
          </div>
        </header>
        <main className="mobile-padding mobile-section">
          <div className="max-w-2xl mx-auto">
            <Card className="border-forest-deep/10">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Keep not found.</p>
                <Button onClick={() => navigate("/dashboard")} className="mt-4">
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mist-green via-white to-mist-green">
      {/* Header */}
      <header className="border-b border-forest-deep/10 bg-white/50 backdrop-blur-sm">
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
                {React.createElement(
                  getTypeIcon(keepData.meta?.type || "secret"),
                  {
                    className: "w-5 h-5 text-forest-deep",
                  },
                )}
                <h1 className="text-lg font-bold text-forest-deep">
                  {keepData.meta?.title || "Keep Details"}
                </h1>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="mobile-padding mobile-section">
        <div className="max-w-2xl mx-auto space-y-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="border-forest-deep/10">
                <CardHeader>
                  <CardTitle className="text-forest-deep flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Keep Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Title
                      </label>
                      <p className="text-forest-deep font-medium">
                        {keepData.meta?.title || "Untitled"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Type
                      </label>
                      <div className="flex items-center gap-2">
                        {React.createElement(
                          getTypeIcon(keepData.meta?.type || "secret"),
                          {
                            className: "w-4 h-4 text-forest-deep",
                          },
                        )}
                        <Badge variant="outline" className="capitalize">
                          {keepData.meta?.type || "secret"}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Keep ID
                      </label>
                      <p className="text-sm font-mono text-muted-foreground break-all">
                        {id}
                      </p>
                    </div>
                    {keepData.meta?.unlockTime && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Unlock Time
                        </label>
                        <p className="text-forest-deep">
                          {format(
                            new Date(keepData.meta.unlockTime),
                            "PPP 'at' p",
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {keepData.meta?.description && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <p className="text-forest-deep">
                        {keepData.meta.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card className="border-forest-deep/10">
                <CardHeader>
                  <CardTitle className="text-forest-deep flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Encrypted Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showContent ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-forest-deep/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-forest-deep" />
                      </div>
                      <h3 className="text-lg font-semibold text-forest-deep mb-2">
                        Content is Encrypted
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        The keep content is securely encrypted. Click the button
                        below to decrypt and view the content.
                      </p>
                      <Button
                        onClick={handleViewContent}
                        disabled={decrypting || !address}
                        className="btn-keepr"
                      >
                        {decrypting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Decrypting...
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Content
                          </>
                        )}
                      </Button>
                      {!address && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Please connect your wallet to view content
                        </p>
                      )}
                    </div>
                  ) : (
                    renderContent()
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Error</span>
                      </div>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full btn-keepr"
          >
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
