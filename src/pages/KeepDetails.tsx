import { ArrowLeft, Shield, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { WalletConnection } from "@/components/wallet/WalletConnection";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertTriangle, User, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Keep } from "@/components/keepr/KeepCard";

export default function KeepDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [keep, setKeep] = useState<Keep | null>(null);
  const [selectedTab, setSelectedTab] = useState("details");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch keep details from blockchain/IPFS
    setLoading(false);
  }, [id]);

  const handleClaim = async () => {
    try {
      // TODO: Implement claim functionality
      toast({
        title: "Keep Claimed",
        description: "Keep contents have been revealed",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to claim Keep",
      });
    }
  };

  const handleEdit = async () => {
    // TODO: Implement edit functionality
    navigate(`/keep/${id}/edit`);
  };

  const handleCancel = async () => {
    try {
      // TODO: Implement cancel functionality
      toast({
        title: "Keep Cancelled",
        description: "Keep has been cancelled successfully",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel Keep",
      });
    }
  };

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
                <Shield className="w-5 h-5 text-forest-deep" />
                <h1 className="text-lg font-bold text-forest-deep">
                  Keep Details
                </h1>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <main className="mobile-padding mobile-section">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="border-forest-deep/10">
            <CardHeader>
              <CardTitle className="text-forest-deep">Keep ID: {id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Detailed Keep view will be implemented here with:
              </p>
              <div className="text-left space-y-2 bg-mist-green p-4 rounded-lg">
                <p className="text-sm">• Complete Keep information display</p>
                <p className="text-sm">• Current status and timeline</p>
                <p className="text-sm">• Recipient and fallback details</p>
                <p className="text-sm">
                  • Encrypted content preview (if authorized)
                </p>
                <p className="text-sm">• Activity log and history</p>
                <p className="text-sm">
                  �� Action buttons (edit, cancel, claim)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Content
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Keep
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Keep
                </Button>
              </div>
            </CardContent>
          </Card>

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
