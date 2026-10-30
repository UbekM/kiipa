import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  Settings,
  Archive,
  Filter,
  Info,
  Power,
} from "lucide-react";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { KeepCard, Keep } from "@/components/keepr/KeepCard";
import { useWeb3ModalAccount, useWeb3Modal } from "@web3modal/ethers/react";
import { InstallPrompt } from "@/components/keepr/InstallPrompt";
import { useKeeps } from "@/hooks/useKeeps";
import { useKeeprContract, BlockchainKeep } from "@/hooks/useKeeprContract";
import { useUserSettings } from "@/hooks/useUserSettings";
import { KEEP_STATUS, KEEP_TYPE } from "@/lib/contracts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useWeb3ModalAccount();
  const { getDisplayName, loading: settingsLoading } = useUserSettings();
  const {
    keeps,
    loading,
    error,
    failedKeeps,
    pinataAvailable,
    refreshKeeps,
    retryKeep,
  } = useKeeps();

  // Smart contract integration
  const {
    getKeepsByCreator,
    getKeepsByRecipient,
    claimKeep,
    activateFallback,
    cancelKeep,
    loading: contractLoading,
    isContractDeployed,
    contractService,
  } = useKeeprContract();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");
  const [blockchainKeeps, setBlockchainKeeps] = useState<BlockchainKeep[]>([]);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const { open } = useWeb3Modal();

  // Fetch blockchain keeps
  const fetchBlockchainKeeps = async () => {
    if (!address || !isContractDeployed || !contractService) return;

    setBlockchainLoading(true);
    try {
      const [createdKeeps, recipientKeeps] = await Promise.all([
        getKeepsByCreator(address),
        getKeepsByRecipient(address),
      ]);

      // Combine and deduplicate keeps
      const allKeeps = [...createdKeeps, ...recipientKeeps];
      const uniqueKeeps = allKeeps.filter(
        (keep, index, self) =>
          index === self.findIndex((k) => k.id === keep.id),
      );

      setBlockchainKeeps(uniqueKeeps);
    } catch (error) {
      console.error("Failed to fetch blockchain keeps:", error);
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Redirect to onboarding if not connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    } else {
      // Fetch keeps now that we are connected and on the dashboard
      refreshKeeps();
    }
  }, [isConnected, navigate]);

  // Fetch blockchain keeps when contract service is ready
  useEffect(() => {
    if (contractService && address && isContractDeployed) {
      fetchBlockchainKeeps();
    }
  }, [contractService, address, isContractDeployed, fetchBlockchainKeeps]);

  // Convert blockchain keeps to Keep format
  const convertBlockchainKeeps = (
    blockchainKeeps: BlockchainKeep[],
  ): Keep[] => {
    return blockchainKeeps.map((blockchainKeep) => ({
      id: `blockchain-${blockchainKeep.id}`,
      title: blockchainKeep.title || "Blockchain Keep",
      description: blockchainKeep.description || "",
      recipient: blockchainKeep.recipient,
      fallback: blockchainKeep.fallbackRecipient,
      creator: blockchainKeep.creator,
      unlockTime: (() => {
        const timestamp = blockchainKeep.unlockTime * 1000;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date() : date;
      })(),
      createdAt: (() => {
        const timestamp = blockchainKeep.createdAt * 1000;
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date() : date;
      })(),
      status: (() => {
        const statusString =
          KEEP_STATUS[blockchainKeep.status as keyof typeof KEEP_STATUS];
        return (statusString?.toLowerCase() as Keep["status"]) || "active";
      })(),
      ipfsHash: blockchainKeep.ipfsHash,
      keepType: (() => {
        const typeString =
          KEEP_TYPE[blockchainKeep.keepType as keyof typeof KEEP_TYPE];
        return (typeString?.toLowerCase() as Keep["keepType"]) || "secret";
      })(),
      blockchainId: blockchainKeep.id, // Add blockchain ID for reference
      ipfsError: false,
    }));
  };

  // Combine IPFS and blockchain keeps
  const allKeeps = [
    ...(keeps || []),
    ...convertBlockchainKeeps(blockchainKeeps),
  ];

  // Filter keeps based on search and tab
  const filteredKeeps = allKeeps.filter((keep) => {
    const matchesQuery =
      !searchQuery ||
      keep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keep.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedTab === "all" ||
      (selectedTab === "active" && keep.status === "active") ||
      (selectedTab === "claimable" &&
        (keep.status === "unlocked" ||
          (keep.unlockTime < new Date() && keep.status === "active"))) ||
      (selectedTab === "claimed" && keep.status === "claimed");

    return matchesQuery && matchesStatus;
  });

  // Calculate statistics including blockchain keeps
  const stats = {
    total: (keeps?.length || 0) + blockchainKeeps.length,
    active:
      (keeps?.filter((k) => k.status === "active").length || 0) +
      blockchainKeeps.filter((k) => {
        const statusString = KEEP_STATUS[k.status as keyof typeof KEEP_STATUS];
        return statusString === "Active";
      }).length,
    claimable:
      (keeps?.filter(
        (k) =>
          k.status === "unlocked" ||
          (k.unlockTime < new Date() && k.status === "active"),
      ).length || 0) +
      blockchainKeeps.filter((k) => {
        const statusString = KEEP_STATUS[k.status as keyof typeof KEEP_STATUS];
        return (
          statusString === "Active" &&
          k.unlockTime < Math.floor(Date.now() / 1000)
        );
      }).length,
    claimed:
      (keeps?.filter((k) => k.status === "claimed").length || 0) +
      blockchainKeeps.filter((k) => {
        const statusString = KEEP_STATUS[k.status as keyof typeof KEEP_STATUS];
        return statusString === "Claimed";
      }).length,
  };

  const handleKeepAction = async (action: string, keep: Keep) => {
    switch (action) {
      case "view":
        navigate(`/keep/${keep.id}`);
        break;
      case "claim":
        // Handle blockchain claim
        if (keep.blockchainId) {
          try {
            await claimKeep(keep.blockchainId);
            // Refresh blockchain keeps after claim
            fetchBlockchainKeeps();
          } catch (error) {
            console.error("Failed to claim keep:", error);
          }
        } else {
          console.log("Claiming keep:", keep.id);
        }
        break;
      case "activateFallback":
        // Handle fallback activation
        if (keep.blockchainId) {
          try {
            await activateFallback(keep.blockchainId);
            // Refresh blockchain keeps after activation
            fetchBlockchainKeeps();
          } catch (error) {
            console.error("Failed to activate fallback:", error);
          }
        }
        break;
      case "reveal":
        // Implement reveal functionality for creators
        console.log("Revealing keep:", keep.id);
        navigate(`/keep/${keep.id}/reveal`);
        break;
      case "edit":
        navigate(`/keep/${keep.id}/edit`);
        break;
      case "cancel":
        // Handle blockchain cancel
        if (keep.blockchainId) {
          try {
            await cancelKeep(keep.blockchainId);
            // Refresh blockchain keeps after cancel
            fetchBlockchainKeeps();
          } catch (error) {
            console.error("Failed to cancel keep:", error);
          }
        } else {
          console.log("Cancelling keep:", keep.id);
        }
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  if (!isConnected) {
    return null; // Will redirect via useEffect
  }

  // Only show error screen for non-Pinata related errors
  if (error && !error.includes("Pinata")) {
    return (
      <div className="empty-state min-h-screen page-shell">
        <div className="empty-state-icon bg-destructive/10 text-destructive">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-xl text-forest-deep mb-2">
          Couldn&apos;t load keeps
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">{error}</p>
        <Button onClick={refreshKeeps} className="btn-keepr">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <InstallPrompt />
      <div className="mobile-page mb-14 page-shell">
        <div className="mobile-header">
          <div className="mobile-spacing-tight">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="brand-mark shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-xl text-forest-deep leading-tight">
                    Keepr
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    Digital legacy manager
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl"
                  onClick={() => navigate("/profile")}
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {stats.claimable > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
                  )}
                </Button>
                <Button
                  onClick={() => open()}
                  variant="outline"
                  size="sm"
                  className="hidden xs:flex sm:flex border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/5 gap-1.5 rounded-xl px-3"
                >
                  <Power className="w-4 h-4" />
                  <span className="sr-only sm:not-sr-only sm:inline">
                    Disconnect
                  </span>
                </Button>
              </div>
            </div>

            <div className="mb-4 w-full">
              <WalletConnection />
            </div>

            <div className="mb-1">
              <h2 className="font-display text-lg sm:text-xl text-forest-deep mb-1">
                {settingsLoading ? (
                  <span className="flex items-center gap-2">
                    Welcome back
                    <div className="w-4 h-4 border-2 border-forest-deep/20 border-t-forest-deep rounded-full animate-spin" />
                  </span>
                ) : (
                  `Welcome back, ${getDisplayName()}`
                )}
              </h2>
              <p className="text-muted-foreground text-sm">
                Manage your keeps and secure your digital legacy
              </p>
            </div>
          </div>
        </div>

        <div className="mobile-content">
          <div className="mobile-spacing">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="stat-tile">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center">
                    <Archive className="w-4 h-4 text-forest-deep" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Total
                  </span>
                </div>
                <div className="text-2xl font-semibold text-forest-deep tabular-nums">
                  {loading ? (
                    <div className="h-7 bg-muted rounded-md animate-pulse w-10" />
                  ) : (
                    stats.total
                  )}
                </div>
              </div>

              <div className="stat-tile">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-touch" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Active
                  </span>
                </div>
                <div className="text-2xl font-semibold text-emerald-touch tabular-nums">
                  {loading ? (
                    <div className="h-7 bg-muted rounded-md animate-pulse w-10" />
                  ) : (
                    stats.active
                  )}
                </div>
              </div>

              <div className="stat-tile">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-warning/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-semibold text-warning tabular-nums">
                    {loading ? (
                      <div className="h-7 bg-muted rounded-md animate-pulse w-10" />
                    ) : (
                      stats.claimable
                    )}
                  </div>
                  {!loading && stats.claimable > 0 && (
                    <Badge className="text-xs px-1.5 py-0 h-5 bg-warning/15 text-warning border-transparent">
                      New
                    </Badge>
                  )}
                </div>
              </div>

              <div className="stat-tile">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-secondary rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-forest-deep" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Claimed
                  </span>
                </div>
                <div className="text-2xl font-semibold text-forest-deep tabular-nums">
                  {loading ? (
                    <div className="h-7 bg-muted rounded-md animate-pulse w-10" />
                  ) : (
                    stats.claimed
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search keeps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border rounded-xl h-11"
                  aria-label="Search keeps"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-11 w-11 border-border rounded-xl"
                aria-label="Filter"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <Tabs
              defaultValue="active"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="mb-5"
            >
              <TabsList className="grid grid-cols-4 w-full bg-secondary/80 p-1 h-auto rounded-xl gap-0.5">
                <TabsTrigger
                  value="active"
                  className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-forest-deep data-[state=active]:shadow-sm"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="claimable"
                  className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-forest-deep data-[state=active]:shadow-sm"
                >
                  Ready
                </TabsTrigger>
                <TabsTrigger
                  value="claimed"
                  className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-forest-deep data-[state=active]:shadow-sm"
                >
                  Claimed
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-lg text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:text-forest-deep data-[state=active]:shadow-sm"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {failedKeeps.length > 0 && (
              <div className="mb-5 p-4 bg-warning/10 border border-warning/25 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm mb-1">
                      Some keeps couldn&apos;t be loaded
                    </p>
                    <p className="text-muted-foreground text-xs mb-3">
                      {failedKeeps.length} keep
                      {failedKeeps.length > 1 ? "s" : ""} failed to load from
                      IPFS. Retry individually or refresh all.
                    </p>
                    <Button
                      onClick={refreshKeeps}
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 border-warning/40 text-foreground hover:bg-warning/10"
                    >
                      Refresh all
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!pinataAvailable && (
              <div className="mb-5 p-4 bg-secondary border border-border rounded-2xl">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-emerald-touch flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm mb-1">
                      IPFS storage unavailable
                    </p>
                    <p className="text-muted-foreground text-xs mb-3">
                      You can still create keeps; they&apos;ll sync when storage
                      returns.
                    </p>
                    <Button
                      onClick={refreshKeeps}
                      size="sm"
                      className="text-xs h-8 btn-keepr"
                    >
                      Retry connection
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pb-20">
              {loading ? (
                <div className="space-y-3" aria-busy="true" aria-label="Loading keeps">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card-keepr p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 bg-muted rounded-xl flex-shrink-0 shimmer" />
                        <div className="flex-1 space-y-2.5 pt-0.5">
                          <div className="h-4 bg-muted rounded-md w-3/4 shimmer" />
                          <div className="h-3 bg-muted rounded-md w-1/2 shimmer" />
                          <div className="flex gap-2">
                            <div className="h-5 bg-muted rounded-md w-14 shimmer" />
                            <div className="h-5 bg-muted rounded-md w-16 shimmer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-center text-muted-foreground text-sm pt-2">
                    Loading your keeps…
                  </p>
                </div>
              ) : filteredKeeps.length === 0 ? (
                <div className="empty-state py-10">
                  {!pinataAvailable ? (
                    <>
                      <div className="empty-state-icon">
                        <Shield className="w-7 h-7" />
                      </div>
                      <p className="font-display text-lg text-forest-deep mb-1">
                        No keeps available
                      </p>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        IPFS storage is temporarily unavailable. You can still
                        create a new keep.
                      </p>
                    </>
                  ) : keeps.length === 0 ? (
                    <>
                      <div className="empty-state-icon">
                        <Shield className="w-7 h-7" />
                      </div>
                      <p className="font-display text-lg text-forest-deep mb-1">
                        No keeps yet
                      </p>
                      <p className="text-muted-foreground text-sm max-w-xs mb-5">
                        Create your first keep to begin secure digital
                        inheritance.
                      </p>
                      <Button
                        className="btn-keepr"
                        onClick={() => navigate("/create")}
                      >
                        <Plus className="w-4 h-4" />
                        Create a keep
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="empty-state-icon">
                        <Search className="w-7 h-7" />
                      </div>
                      <p className="font-display text-lg text-forest-deep mb-1">
                        No matches
                      </p>
                      <p className="text-muted-foreground text-sm">
                        No keeps match your search or filter.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                filteredKeeps.map((keep) => (
                  <KeepCard
                    key={keep.id}
                    keep={keep}
                    currentUserAddress={address}
                    onView={() => handleKeepAction("view", keep)}
                    onEdit={() => handleKeepAction("edit", keep)}
                    onCancel={() => handleKeepAction("cancel", keep)}
                    onClaim={() => handleKeepAction("claim", keep)}
                    onReveal={() => handleKeepAction("reveal", keep)}
                    onRetry={retryKeep}
                  />
                ))
              )}
            </div>

            <Button
              size="lg"
              className="fab"
              onClick={() => navigate("/create")}
              aria-label="Create keep"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
