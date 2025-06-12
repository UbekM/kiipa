// FallbackClaim.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

const FallbackClaim = () => {
  const [keepId, setKeepId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">
          Fallback & Claim
        </h1>
        <p className="mb-4 text-gray-700">
          If you are a designated fallback recipient, you can claim assets here
          if the original owner is unavailable.
        </p>
        <a
          href="https://sepolia-blockscout.lisk.com/address/0x2F72BAeD02B119A64594aA4cad157707b8f85649#code"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mb-6 text-blue-600 hover:text-blue-800 underline"
        >
          View Smart Contract
        </a>
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
      </div>
    </div>
  );
};

export default FallbackClaim;
