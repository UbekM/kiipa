// Documentation.tsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Documentation</h1>
        <p className="mb-6 text-gray-700">
          Welcome to the documentation. Here you will find all the information
          you need to use the app effectively.
        </p>
        <ul className="space-y-3 text-left">
          <li>
            <a
              href="https://github.com/your-org/keepr-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Official Documentation
            </a>
          </li>
          <li>
            <a
              href="https://github.com/your-org/keepr-guides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              User Guides
            </a>
          </li>
          <li>
            <a
              href="https://github.com/your-org/keepr-faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              FAQ
            </a>
          </li>
          <li>
            <a
              href="https://sepolia-blockscout.lisk.com/address/0x2F72BAeD02B119A64594aA4cad157707b8f85649#code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Smart Contract Source
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Documentation;
