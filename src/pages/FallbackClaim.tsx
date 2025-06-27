import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Shield, ArrowLeft } from "lucide-react";
import { WalletConnection } from "@/components/wallet/WalletConnection";

const FallbackClaim = () => {
  const [keepId, setKeepId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // TODO: Integrate with smart contract for claim logic
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    setMessage("");
    try {
      // Simulate claim process
      setTimeout(() => {
        setStatus("success");
        setMessage(
          "Claim submitted! If eligible, you will receive access soon.",
        );
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage(
        "Failed to submit claim. Please check your details and try again.",
      );
    }
  };

  return (
    <div className="app-container">
      <div className="mobile-page">
        {/* Header */}
        <div className="mobile-header">
          <div className="mobile-spacing-tight">
            <div className="flex items-center justify-between mb-4">
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
                    Fallback & Claim
                  </h1>
                </div>
              </div>
              {/* <WalletConnection /> */}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mobile-content">
          <div className="mobile-spacing max-w-md mx-auto pt-24">
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-forest-deep">
                  Claim as Fallback Recipient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">
                  If you are a designated fallback recipient, you can claim
                  assets here if the original owner is unavailable.
                </p>
                <Button
                  type="submit"
                  className="w-full btn-keepr mb-12 bg-green-800/20 text-green-900 hover:bg-green-800/80 hover:text-white"
                  disabled={status === "pending"}
                >
                  <a
                    href="https://sepolia-blockscout.lisk.com/address/0x2F72BAeD02B119A64594aA4cad157707b8f85649#code"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="  "
                  >
                    View Smart Contract
                  </a>
                </Button>

                <form onSubmit={handleClaim} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-forest-deep mb-1">
                      Keep ID
                    </label>
                    <Input
                      value={keepId}
                      onChange={(e) => setKeepId(e.target.value)}
                      placeholder="Enter Keep ID"
                      required
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forest-deep mb-1">
                      Your Wallet Address
                    </label>
                    <Input
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      required
                      className="bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-keepr"
                    disabled={status === "pending"}
                  >
                    {status === "pending" ? "Submitting..." : "Claim Keep"}
                  </Button>
                  {status === "success" && (
                    <div className="flex items-center gap-2 text-green-700 mt-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{message}</span>
                    </div>
                  )}
                  {status === "error" && (
                    <div className="flex items-center gap-2 text-red-600 mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{message}</span>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FallbackClaim;
