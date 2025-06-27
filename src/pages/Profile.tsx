import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  Shield,
  Check,
  X,
  Key,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { NotificationTest } from "@/components/keepr/NotificationTest";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import {
  getEncryptionKeysForAddress,
  generateDeterministicKeyPairForAddress,
  exportPrivateKey,
  exportPublicKey,
  importPublicKey,
} from "@/lib/encryption";
import { uploadToIPFS, downloadFromIPFS } from "@/lib/wallet";
import { formatAddress } from "@/lib/wallet";
import { Badge } from "@/components/ui/badge";

interface UserSettings {
  displayName: string;
  inactivityPeriod: string;
  pingMethod: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  statusUpdates: boolean;
  activityReminders: boolean;
  emergencyEmail: string;
  emergencyPhone: string;
  settingsHash?: string;
  lastUpdated?: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { address, chainId } = useWeb3ModalAccount();
  const [loading, setLoading] = useState(false);
  const [keysLoading, setKeysLoading] = useState(false);
  const [hasEncryptionKeys, setHasEncryptionKeys] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    inactivityPeriod: "30",
    pingMethod: "automatic",
    emailNotifications: true,
    pushNotifications: true,
    statusUpdates: true,
    activityReminders: true,
    emergencyEmail: "",
    emergencyPhone: "",
  });

  // Load settings on component mount
  useEffect(() => {
    if (address) {
      loadSettings();
      checkEncryptionKeys();
    }
  }, [address]);

  // Check if user has encryption keys
  const checkEncryptionKeys = async () => {
    if (!address) return;

    try {
      setKeysLoading(true);
      await getEncryptionKeysForAddress(address);
      setHasEncryptionKeys(true);
    } catch (error) {
      setHasEncryptionKeys(false);
    } finally {
      setKeysLoading(false);
    }
  };

  // Generate new encryption keys
  const generateKeys = async () => {
    if (!address) return;

    try {
      setKeysLoading(true);
      await generateDeterministicKeyPairForAddress(address);
      setHasEncryptionKeys(true);
      toast({
        title: "Encryption Keys Generated",
        description: "Your encryption keys have been created successfully",
      });
    } catch (error) {
      console.error("Error generating keys:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate encryption keys",
      });
    } finally {
      setKeysLoading(false);
    }
  };

  // Export private key
  const exportKeys = async () => {
    if (!address) return;

    try {
      setKeysLoading(true);
      const { publicKey: publicKeyString, privateKey } =
        await getEncryptionKeysForAddress(address);

      // Export the private key to string format
      const privateKeyString = await exportPrivateKey(privateKey);

      // Import the public key to get the CryptoKey object for export
      const publicKeyCryptoKey = await importPublicKey(publicKeyString);
      const publicKeyExported = await exportPublicKey(publicKeyCryptoKey);

      // Create downloadable file
      const keyData = {
        address,
        privateKey: privateKeyString,
        publicKey: publicKeyExported,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(keyData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keepr-keys-${address.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Keys Exported",
        description: "Your encryption keys have been downloaded",
      });
    } catch (error) {
      console.error("Error exporting keys:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export encryption keys",
      });
    } finally {
      setKeysLoading(false);
    }
  };

  // Load settings from localStorage and IPFS
  const loadSettings = async () => {
    if (!address) return;

    try {
      // First try to load from localStorage
      const localKey = `keepr-settings-${address}`;
      const localSettings = localStorage.getItem(localKey);

      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        setSettings(parsed);

        // If we have a settings hash, try to load from IPFS for latest version
        if (parsed.settingsHash) {
          try {
            const ipfsSettings = await downloadFromIPFS(parsed.settingsHash);
            if (ipfsSettings && ipfsSettings.lastUpdated > parsed.lastUpdated) {
              setSettings(ipfsSettings);
              localStorage.setItem(localKey, JSON.stringify(ipfsSettings));
            }
          } catch (error) {
            console.warn(
              "Failed to load settings from IPFS, using local version:",
              error,
            );
          }
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  // Save settings to localStorage and IPFS
  const handleSave = async () => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first",
      });
      return;
    }

    setLoading(true);
    try {
      const updatedSettings: UserSettings = {
        ...settings,
        lastUpdated: Date.now(),
      };

      // Save to localStorage
      const localKey = `keepr-settings-${address}`;
      localStorage.setItem(localKey, JSON.stringify(updatedSettings));

      // Save to IPFS for backup and cross-device sync
      try {
        const ipfsHash = await uploadToIPFS(updatedSettings, {
          name: `keepr-settings-${address}`,
          keyvalues: {
            type: "user-settings",
            address: address,
            timestamp: Date.now().toString(),
          },
        });

        updatedSettings.settingsHash = ipfsHash;
        localStorage.setItem(localKey, JSON.stringify(updatedSettings));
        setSettings(updatedSettings);

        toast({
          title: "Settings Saved",
          description:
            "Your preferences have been updated and backed up to IPFS",
        });
      } catch (ipfsError) {
        console.warn(
          "Failed to save to IPFS, using local storage only:",
          ipfsError,
        );
        toast({
          title: "Settings Saved Locally",
          description: "Your preferences have been saved (IPFS backup failed)",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-white">
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
                <Settings className="w-5 h-5 text-forest-deep" />
                <h1 className="text-lg font-bold text-forest-deep">
                  Profile & Settings
                </h1>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="mobile-padding mobile-section mt-14">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Info */}
          <Card className="border-forest-deep/10">
            <CardHeader>
              <CardTitle className="text-forest-deep flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Display Name
                  </label>
                  <Input
                    placeholder="Enter your display name"
                    value={settings.displayName}
                    onChange={(e) =>
                      setSettings({ ...settings, displayName: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Connected Wallet
                  </label>
                  <div className="bg-mist-green p-3 rounded-lg">
                    {address ? (
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-forest-deep">
                          {formatAddress(address)}
                        </code>
                        <Badge
                          variant={chainId === 4202 ? "default" : "destructive"}
                        >
                          {chainId === 4202 ? "Lisk Sepolia" : "Wrong Network"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-forest-deep/60">
                        <AlertTriangle className="w-4 h-4" />
                        Wallet not connected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Encryption Key Management */}
          <Card className="border-forest-deep/10">
            <CardHeader>
              <CardTitle className="text-forest-deep flex items-center gap-2">
                <Key className="w-5 h-5" />
                Encryption Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-forest-deep">
                      Encryption Key Status
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {hasEncryptionKeys
                        ? "Your encryption keys are set up and ready"
                        : "Generate encryption keys to secure your keeps"}
                    </p>
                  </div>
                  <Badge
                    variant={hasEncryptionKeys ? "default" : "destructive"}
                  >
                    {hasEncryptionKeys ? "Ready" : "Not Set"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {!hasEncryptionKeys ? (
                    <Button
                      onClick={generateKeys}
                      disabled={keysLoading || !address}
                      className="btn-keepr"
                    >
                      {keysLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          Generate Keys
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={exportKeys}
                      disabled={keysLoading || !address}
                      variant="outline"
                      className="border-forest-deep/20"
                    >
                      {keysLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-forest-deep/20 border-t-forest-deep rounded-full animate-spin" />
                          Exporting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Keys
                        </span>
                      )}
                    </Button>
                  )}

                  {hasEncryptionKeys && (
                    <Button
                      onClick={checkEncryptionKeys}
                      disabled={keysLoading}
                      variant="outline"
                      size="sm"
                      className="border-forest-deep/20"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${keysLoading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  )}
                </div>

                {!address && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Connect Wallet Required
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      Please connect your wallet to manage encryption keys
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inactivity Settings */}
          <Card className="border-forest-deep/10">
            <CardHeader>
              <CardTitle className="text-forest-deep flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Inactivity Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Default Inactivity Period
                  </label>
                  <Select
                    value={settings.inactivityPeriod}
                    onValueChange={(value) =>
                      setSettings({ ...settings, inactivityPeriod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                      <SelectItem value="365">1 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Activity Check Method
                  </label>
                  <Select
                    value={settings.pingMethod}
                    onValueChange={(value) =>
                      setSettings({ ...settings, pingMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">
                        Automatic (App Usage)
                      </SelectItem>
                      <SelectItem value="manual">
                        Manual Confirmation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Emergency Contact Email
                  </label>
                  <Input
                    type="email"
                    placeholder="backup@example.com"
                    value={settings.emergencyEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emergencyEmail: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-forest-deep">
                    Emergency Contact Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={settings.emergencyPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        emergencyPhone: e.target.value,
                      })
                    }
                    className="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-forest-deep/10">
            <CardHeader>
              <CardTitle className="text-forest-deep flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-forest-deep">
                      Email Notifications
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-forest-deep">
                      Push Notifications
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Get notified on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-forest-deep">
                      Keep Status Updates
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Updates about your Keeps' status
                    </p>
                  </div>
                  <Switch
                    checked={settings.statusUpdates}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, statusUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium text-forest-deep">
                      Activity Reminders
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Reminders to confirm activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.activityReminders}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, activityReminders: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development: Notification Testing */}
          {import.meta.env.DEV && (
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-forest-deep flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Development: Email Notification Testing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NotificationTest />
              </CardContent>
            </Card>
          )}

          {/* Settings Sync Status */}
          {settings.lastUpdated && (
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-forest-deep flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Settings Sync Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-forest-deep">
                      Last Updated
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(settings.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-forest-deep">
                      IPFS Backup
                    </span>
                    <Badge
                      variant={settings.settingsHash ? "default" : "secondary"}
                    >
                      {settings.settingsHash ? "Synced" : "Local Only"}
                    </Badge>
                  </div>
                  {settings.settingsHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-forest-deep">
                        IPFS Hash
                      </span>
                      <code className="text-xs text-muted-foreground bg-mist-green px-2 py-1 rounded">
                        {settings.settingsHash.slice(0, 12)}...
                      </code>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 btn-keepr"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Save Changes
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-forest-deep/20 mb-14"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
