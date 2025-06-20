import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  TrendingUp,
  Archive,
  Users,
  Menu,
  Zap,
  Star,
  ArrowRight,
  Filter,
} from "lucide-react";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import { KeepCard, Keep } from "@/components/keepr/KeepCard";
import { useWeb3ModalAccount } from "@web3modal/ethers/react";
import { InstallPrompt } from "@/components/keepr/InstallPrompt";
import { useKeeps } from "@/hooks/useKeeps";
import { LoadingState } from "@/components/LoadingState";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useWeb3ModalAccount();
  const {
    keeps,
    loading,
    error,
    failedKeeps,
    searchKeeps,
    refreshKeeps,
    retryKeep,
  } = useKeeps();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("active");
  const [showSearch, setShowSearch] = useState(false);

  // Redirect to onboarding if not connected
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  // Filter keeps based on search and tab
  const filteredKeeps = searchKeeps(
    searchQuery,
    undefined,
    selectedTab === "all" ? undefined : selectedTab,
  );

  // Calculate statistics
  const stats = {
    total: keeps.length,
    active: keeps.filter((k) => k.status === "active").length,
    claimable: keeps.filter(
      (k) =>
        k.status === "unlocked" ||
        (k.unlockTime < new Date() && k.status === "active"),
    ).length,
    claimed: keeps.filter((k) => k.status === "claimed").length,
  };

  const handleKeepAction = async (action: string, keep: Keep) => {
    switch (action) {
      case "view":
        navigate(`/keep/${keep.id}`);
        break;
      case "claim":
        // Implement claim functionality
        console.log("Claiming keep:", keep.id);
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
        // Implement cancel functionality
        console.log("Cancelling keep:", keep.id);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  if (!isConnected) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-forest-deep mb-2">
          Error Loading Keeps
        </h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={refreshKeeps}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <InstallPrompt />
      <div className="mobile-page">
        {/* Native-style header */}
        <div className="mobile-header">
          <div className="mobile-spacing-tight">
            {/* Top header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-forest-deep to-pine-fade rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-forest-deep">Keepr</h1>
                  <p className="text-xs text-muted-foreground">
                    Digital Legacy Manager
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl relative"
                  onClick={() => navigate("/profile")}
                >
                  <Settings className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl relative"
                >
                  <Bell className="w-5 h-5" />
                  {stats.claimable > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Button>
              </div>
            </div>

            {/* Wallet connection */}
            <div className="mb-4">
              <WalletConnection />
            </div>

            {/* Welcome message */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-forest-deep mb-1">
                Welcome back! 👋
              </h2>
              <p className="text-muted-foreground text-sm">
                Manage your Keeps and secure your digital legacy
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mobile-content">
          <div className="mobile-spacing">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="card-native p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-forest-deep/10 rounded-xl flex items-center justify-center">
                    <Archive className="w-4 h-4 text-forest-deep" />
                  </div>
                  <span className="text-sm font-semibold text-forest-deep">
                    Total Keeps
                  </span>
                </div>
                <p className="text-2xl font-bold text-forest-deep">
                  {stats.total}
                </p>
              </div>

              <div className="card-native p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-touch" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-touch">
                    Active
                  </span>
                </div>
                <p className="text-2xl font-bold text-emerald-touch">
                  {stats.active}
                </p>
              </div>

              <div className="card-native p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">
                    Claimable
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.claimable}
                  </p>
                  {stats.claimable > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-xs px-1.5 py-0.5 h-5"
                    >
                      New
                    </Badge>
                  )}
                </div>
              </div>

              <div className="card-native p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    Claimed
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.claimed}
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search keeps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-forest-deep/20"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="active"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="mb-6"
            >
              <TabsList className="grid grid-cols-4 bg-transparent gap-2">
                <TabsTrigger
                  value="active"
                  className="bg-white data-[state=active]:bg-forest-deep data-[state=active]:text-white"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="claimable"
                  className="bg-white data-[state=active]:bg-forest-deep data-[state=active]:text-white"
                >
                  Ready
                </TabsTrigger>
                <TabsTrigger
                  value="claimed"
                  className="bg-white data-[state=active]:bg-forest-deep data-[state=active]:text-white"
                >
                  Claimed
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="bg-white data-[state=active]:bg-forest-deep data-[state=active]:text-white"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Failed Keeps Warning */}
            {failedKeeps.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-yellow-800 text-sm mb-1">
                      Some keeps couldn't be loaded
                    </p>
                    <p className="text-yellow-700 text-xs mb-3">
                      {failedKeeps.length} keep
                      {failedKeeps.length > 1 ? "s" : ""} failed to load from
                      IPFS. You can retry loading them individually or refresh
                      all keeps.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={refreshKeeps}
                        size="sm"
                        variant="outline"
                        className="text-xs px-3 py-1 h-7 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        Refresh All
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keeps List */}
            <div className="space-y-4">
              {filteredKeeps.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No keeps found</p>
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

            {/* Create Keep Button */}
            <div className="fixed bottom-8 right-8">
              <Button
                size="lg"
                className="btn-keepr h-14 w-14 rounded-full shadow-lg"
                onClick={() => navigate("/create")}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
