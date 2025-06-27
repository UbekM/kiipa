import { useState, useEffect } from "react";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { downloadFromIPFS } from "@/lib/wallet";

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

export function useUserSettings() {
  const { address } = useWeb3ModalAccount();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage and IPFS
  const loadSettings = async () => {
    if (!address) return;

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Load settings when address changes
  useEffect(() => {
    if (address) {
      loadSettings();
    } else {
      setSettings(null);
    }
  }, [address]);

  // Get display name with fallback
  const getDisplayName = (): string => {
    if (settings?.displayName) {
      return settings.displayName;
    }
    if (address) {
      return address.slice(0, 6) + "..." + address.slice(-4);
    }
    return "User";
  };

  return {
    settings,
    loading,
    getDisplayName,
    refreshSettings: loadSettings,
  };
} 