import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  triggerNotificationForKeep,
  getNotificationJobs,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationTest() {
  const [ipfsHash, setIpfsHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState(getNotificationJobs());
  const { toast } = useToast();

  const handleTestNotification = async () => {
    if (!ipfsHash.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an IPFS hash",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await triggerNotificationForKeep(ipfsHash);

      if (success) {
        toast({
          title: "Notification Sent",
          description: "Test notification was sent successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Notification Failed",
          description: "Failed to send test notification",
        });
      }

      // Refresh jobs list
      setJobs(getNotificationJobs());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshJobs = () => {
    setJobs(getNotificationJobs());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Sent
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Test Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ipfs-hash">IPFS Hash</Label>
            <Input
              id="ipfs-hash"
              placeholder="Enter IPFS hash of a keep"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestNotification}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send Test Notification"}
            </Button>
            <Button variant="outline" onClick={refreshJobs}>
              Refresh
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            This will send a test email notification for the specified keep.
            Check the browser console to see the mock email content.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground">No notifications sent yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium">{job.keepTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {job.recipientEmail} (
                        {job.recipientAddress.slice(0, 6)}...
                        {job.recipientAddress.slice(-4)})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {job.createdAt.toLocaleString()}
                        {job.sentAt &&
                          ` • Sent: ${job.sentAt.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
