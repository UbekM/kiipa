import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  Download,
  Eye,
  EyeOff,
  FileText,
  Key,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { downloadFromIPFS } from "@/lib/wallet";
import {
  decryptKeep,
  getEncryptionPrivateKeyForAddress,
} from "@/lib/encryption";
import { LoadingState } from "@/components/LoadingState";

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
  };
}

export default function KeepReveal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address } = useWeb3ModalAccount();
  const { provider } = useWeb3ModalProvider();

  const [loading, setLoading] = useState(true);
  const [decrypting, setDecrypting] = useState(false);
  const [keepData, setKeepData] = useState<KeepData | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<ArrayBuffer | null>(
    null,
  );
  const [showContent, setShowContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      console.log("Data type:", typeof data);
      console.log("Data keys:", Object.keys(data));

      if (data.meta) {
        console.log("Meta data found:", data.meta);
      } else {
        console.log("No meta data found in:", data);
      }

      setKeepData(data);
    } catch (err) {
      console.error("Error fetching keep data:", err);
      setError("Failed to fetch keep data");
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    if (!keepData || !address) return;

    try {
      setDecrypting(true);
      setError(null);

      console.log("Decrypting keep content...");
      console.log("Keep data:", keepData);
      console.log("User address:", address);

      // Check if user has encryption keys
      try {
        await getEncryptionPrivateKeyForAddress(address);
      } catch (keyError) {
        throw new Error(
          "You don't have encryption keys set up. Please create a keep first to generate your keys.",
        );
      }

      const decrypted = await decryptKeep(keepData, address, provider);
      console.log("Content decrypted successfully");

      setDecryptedContent(decrypted);
      setShowContent(true);

      toast({
        title: "Keep Revealed",
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
      const textDecoder = new TextDecoder();
      const textContent = textDecoder.decode(decryptedContent);

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-forest-deep">Content</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContent(!showContent)}
                className="flex items-center gap-2"
              >
                {showContent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showContent ? "Hide" : "Show"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>

          {showContent && (
            <Card className="border-forest-deep/10">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm text-forest-deep font-mono bg-mist-green/50 p-4 rounded-lg overflow-auto max-h-96">
                  {textContent}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      );
    } catch {
      // If text decoding fails, show as binary
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-forest-deep">
              Binary Content
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>

          <Card className="border-forest-deep/10">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                This is binary content. Use the download button to save the
                file.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Size: {decryptedContent.byteLength} bytes
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-padding py-4">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-forest-deep"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold text-forest-deep">Reveal Keep</h1>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!keepData || !keepData.meta) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-padding py-4">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-forest-deep"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-bold text-forest-deep">Reveal Keep</h1>
          </div>

          <Card className="border-forest-deep/10">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Invalid keep data structure
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(keepData.meta.type || "secret");

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
                  Reveal Keep
                </h1>
              </div>
            </div>
            {/* <WalletConnection /> */}
          </div>
        </div>
      </header>

      <main className="mobile-padding mobile-section mt-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Keep Info */}
          <Card className="border-forest-deep/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-forest-deep">
                    {keepData.meta?.title || "Untitled Keep"}
                  </CardTitle>
                  {keepData.meta?.description && (
                    <p className="text-muted-foreground mt-1">
                      {keepData.meta.description}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-forest-deep/10">
                  <TypeIcon className="w-6 h-6 text-forest-deep" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {keepData.meta?.type || "secret"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ID: {id?.slice(0, 8)}...
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Reveal Section */}
          {!decryptedContent ? (
            <Card className="border-forest-deep/10">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Shield className="w-12 h-12 text-forest-deep mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-forest-deep mb-2">
                      Ready to Reveal
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Click the button below to decrypt and reveal the keep
                      content.
                    </p>
                  </div>
                  <Button
                    onClick={handleReveal}
                    disabled={decrypting || !address}
                    className="btn-native"
                    size="lg"
                  >
                    {decrypting ? "Decrypting..." : "Reveal Content"}
                  </Button>
                  {!address && (
                    <p className="text-sm text-red-600">
                      Please connect your wallet to reveal the content
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            renderContent()
          )}
        </div>
      </main>
    </div>
  );
}
