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

// Mock data for demonstration
const mockKeeps: Keep[] = [];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isConnected, address } = useWeb3ModalAccount();
  const [keeps, setKeeps] = useState<Keep[]>(mockKeeps);
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
  const filteredKeeps = keeps.filter((keep) => {
    const matchesSearch =
      keep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      keep.description?.toLowerCase().includes(searchQuery.toLowerCase());

    switch (selectedTab) {
      case "active":
        return matchesSearch && keep.status === "active";
      case "claimable":
        return (
          matchesSearch &&
          (keep.status === "unlocked" ||
            (keep.unlockTime < new Date() && keep.status === "active"))
        );
      case "claimed":
        return matchesSearch && keep.status === "claimed";
      case "all":
      default:
        return matchesSearch;
    }
  });

  // Calculate statistics
  const stats = {
    total: 0,
    active: 0,
    claimable: 0,
    claimed: 0,
  };

  const handleKeepAction = (action: string, keep: Keep) => {
    console.log(`${action} keep:`, keep.id);
    // Implement keep actions here
  };

  if (!isConnected) {
    return null; // Will redirect via useEffect
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

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search your Keeps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-native pl-12 pr-4"
                />
              </div>
            </div>

            {/* Keeps Tabs */}
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-1">
                <TabsTrigger
                  value="active"
                  className="data-[state=active]:bg-forest-deep data-[state=active]:text-white rounded-xl font-medium"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="claimable"
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white rounded-xl font-medium"
                >
                  Ready
                </TabsTrigger>
                <TabsTrigger
                  value="claimed"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-xl font-medium"
                >
                  Claimed
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-forest-deep data-[state=active]:text-white rounded-xl font-medium"
                >
                  All
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredKeeps.length === 0 ? (
                  <div className="card-native p-8 text-center">
                    <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Archive className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-forest-deep mb-2">
                      No Keeps Found
                    </h3>
                    <p className="text-muted-foreground mb-6 text-sm">
                      {searchQuery
                        ? `No Keeps match "${searchQuery}"`
                        : "Welcome to Keepr! Create your first encrypted Keep to start securing your digital legacy"}
                    </p>
                    {!searchQuery && (
                      <div className="space-y-4">
                        <Button
                          onClick={() => navigate("/create")}
                          className="btn-native"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Keep
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Your data is end-to-end encrypted and stored on IPFS
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredKeeps.map((keep) => (
                      <KeepCard
                        key={keep.id}
                        keep={keep}
                        onView={(keep) => navigate(`/keep/${keep.id}`)}
                        onEdit={(keep) => navigate(`/keep/${keep.id}/edit`)}
                        onClaim={(keep) => handleKeepAction("claim", keep)}
                        onCancel={(keep) => handleKeepAction("cancel", keep)}
                        compact={true}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            {filteredKeeps.length > 0 && (
              <div className="card-native p-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-forest-deep" />
                  <h3 className="font-bold text-forest-deep">Quick Actions</h3>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/create")}
                    className="w-full justify-between border-forest-deep/20 hover:bg-forest-deep/5 rounded-xl p-4 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4" />
                      <span>Create New Keep</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    className="w-full justify-between border-forest-deep/20 hover:bg-forest-deep/5 rounded-xl p-4 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      <span>Update Settings</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {stats.claimable > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTab("claimable")}
                      className="w-full justify-between border-yellow-500/20 hover:bg-yellow-500/5 rounded-xl p-4 h-auto"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-600">Review Claims</span>
                      </div>
                      <Badge variant="destructive" className="h-5 px-2">
                        {stats.claimable}
                      </Badge>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Bottom padding for FAB */}
            <div className="h-20" />
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => navigate("/create")}
          className="fab haptic-medium"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
