import { useState } from "react";
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  Shield,
  Check,
  X,
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

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
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

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Save settings to backend/blockchain
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully",
      });
    } catch (error) {
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
    <div className="min-h-screen bg-white">
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

      <main className="mobile-padding mobile-section">
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
                    <code className="text-sm text-forest-deep">
                      0x742d35...C6d1D6d
                    </code>
                  </div>
                </div>
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
              className="border-forest-deep/20"
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
