// Documentation.tsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Shield,
  Key,
  FileText,
  Heart,
  Clock,
  Users,
  Lock,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Download,
  Upload,
  Eye,
  Settings,
  HelpCircle,
  Code,
  Github,
  Twitter,
  Mail,
  ChevronRight,
  Star,
  Award,
  Target,
  Lightbulb,
  Rocket,
  Cpu,
  Database,
  Network,
  Wallet,
  Smartphone,
  Monitor,
  Server,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WalletConnection } from "@/components/wallet/WalletConnection";

const Documentation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: Shield,
      title: "Secure Encryption",
      description:
        "Military-grade encryption using RSA-2048 and AES-256 for maximum security",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Globe,
      title: "IPFS Storage",
      description:
        "Decentralized storage on IPFS ensures your data is always accessible",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "Multi-Party Access",
      description:
        "Support for recipients and fallback recipients with different access levels",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      title: "Time-Based Release",
      description: "Set specific unlock times for automatic content release",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Key,
      title: "Key Management",
      description:
        "Secure key derivation from wallet signatures - no private keys stored",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Immediate content retrieval once conditions are met",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const keepTypes = [
    {
      icon: Shield,
      title: "Secrets",
      description:
        "Store sensitive information like passwords, API keys, or personal secrets",
      examples: ["Passwords", "API Keys", "Private Notes", "Access Codes"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: FileText,
      title: "Documents",
      description:
        "Secure important documents like contracts, certificates, or legal papers",
      examples: ["Contracts", "Certificates", "Legal Documents", "Reports"],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Key,
      title: "Keys",
      description:
        "Store cryptographic keys, recovery phrases, or access credentials",
      examples: [
        "Recovery Phrases",
        "Private Keys",
        "Access Tokens",
        "Certificates",
      ],
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Heart,
      title: "Inheritance",
      description:
        "Plan your digital legacy with messages and assets for loved ones",
      examples: [
        "Personal Messages",
        "Asset Instructions",
        "Final Wishes",
        "Family History",
      ],
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description:
        "All content is encrypted before leaving your device using industry-standard algorithms",
      icon: Lock,
    },
    {
      title: "Zero-Knowledge Architecture",
      description:
        "We cannot access your content - only you and authorized recipients can decrypt it",
      icon: Eye,
    },
    {
      title: "Decentralized Storage",
      description:
        "Content is stored on IPFS, making it resistant to censorship and single points of failure",
      icon: Database,
    },
    {
      title: "Wallet-Based Authentication",
      description:
        "Secure authentication using your existing wallet - no additional passwords needed",
      icon: Wallet,
    },
    {
      title: "Deterministic Key Generation",
      description:
        "Encryption keys are derived from your wallet signature, ensuring consistency and security",
      icon: Key,
    },
    {
      title: "Multi-Party Access Control",
      description: "Granular control over who can access your content and when",
      icon: Users,
    },
  ];

  const faqs = [
    {
      question: "How does Keepr ensure my content is secure?",
      answer:
        "Keepr uses military-grade encryption (RSA-2048 + AES-256) and stores content on decentralized IPFS. Your content is encrypted before leaving your device, and only authorized recipients can decrypt it. We cannot access your content at any point.",
    },
    {
      question: "What happens if I lose access to my wallet?",
      answer:
        "If you lose access to your wallet, you can still access your keeps if you have the private key or recovery phrase. The encryption keys are deterministically generated from your wallet signature, so as long as you can sign with the same wallet, you can access your content.",
    },
    {
      question: "Can I change the recipient of a keep after creating it?",
      answer:
        "Currently, keeps are immutable once created. This ensures the security and integrity of the system. If you need to change recipients, you'll need to create a new keep with the updated recipient information.",
    },
    {
      question: "What happens if IPFS is down or slow?",
      answer:
        "Keepr includes robust error handling and retry mechanisms. If IPFS is temporarily unavailable, you'll see error states in the dashboard with retry options. The system also uses multiple IPFS gateways for redundancy.",
    },
    {
      question: "How much does it cost to use Keepr?",
      answer:
        "Keepr is currently free to use. You only pay for the gas fees associated with blockchain transactions (creating keeps, claiming, etc.) on the Lisk network. IPFS storage is also free through our Pinata integration.",
    },
    {
      question: "Can I use Keepr on mobile devices?",
      answer:
        "Yes! Keepr is fully responsive and works on all devices. You can access it through any modern web browser on your smartphone, tablet, or desktop. The interface automatically adapts to your screen size.",
    },
    {
      question: "What file types can I store?",
      answer:
        "Keepr supports any file type. For text content, you can paste it directly. For files, you can upload documents, images, videos, or any other file type. There are no file size restrictions, though larger files may take longer to upload.",
    },
    {
      question: "How do I know when someone has claimed my keep?",
      answer:
        "Currently, keep claims are recorded on the blockchain and visible in the dashboard. In future versions, we plan to add notifications and real-time updates for keep status changes.",
    },
  ];

  const technicalSpecs = [
    {
      category: "Encryption",
      specs: [
        "RSA-2048 for asymmetric encryption",
        "AES-256-GCM for symmetric encryption",
        "PBKDF2 for key derivation",
        "Deterministic key generation from wallet signatures",
      ],
    },
    {
      category: "Storage",
      specs: [
        "IPFS (InterPlanetary File System) for decentralized storage",
        "Pinata gateway for reliable access",
        "JSON metadata storage with encrypted content",
        "Automatic content addressing and deduplication",
      ],
    },
    {
      category: "Blockchain",
      specs: [
        "Lisk blockchain for keep management",
        "Smart contracts for access control",
        "Gas-optimized transactions",
        "Multi-network support (Mainnet & Sepolia)",
      ],
    },
    {
      category: "Security",
      specs: [
        "Zero-knowledge architecture",
        "Client-side encryption only",
        "No private key storage",
        "Multi-party access control",
        "Time-based release mechanisms",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-forest-deep/5 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="text-forest-deep"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-forest-deep" />
                <h1 className="text-xl font-bold text-forest-deep">
                  Documentation
                </h1>
              </div>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-forest-deep/10 text-forest-deep px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Digital Legacy Protocol
          </div>
          <h1 className="text-4xl font-bold text-forest-deep mb-4">
            Welcome to Keepr Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Learn how to secure your digital legacy with Keepr's decentralized,
            encrypted storage solution. From basic usage to advanced security
            features, find everything you need to know here.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/create")}
              className="btn-keepr"
              size="lg"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Get Started
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("security")}
              size="lg"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Overview
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-5 bg-white border border-forest-deep/10">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-forest-deep data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="data-[state=active]:bg-forest-deep data-[state=active]:text-white"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-forest-deep data-[state=active]:text-white"
            >
              Security
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-forest-deep data-[state=active]:text-white"
            >
              FAQ
            </TabsTrigger>
            <TabsTrigger
              value="technical"
              className="data-[state=active]:bg-forest-deep data-[state=active]:text-white"
            >
              Technical
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-forest-deep/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-forest-deep">
                    <Target className="w-5 h-5" />
                    What is Keepr?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Keepr is a decentralized digital legacy protocol that allows
                    you to securely store and share important information with
                    designated recipients. Built on the Lisk blockchain and
                    IPFS, it provides military-grade encryption with
                    zero-knowledge architecture.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Decentralized storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Time-based release</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-forest-deep/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-forest-deep">
                    <Lightbulb className="w-5 h-5" />
                    Key Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-forest-deep/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-forest-deep" />
                      </div>
                      <div>
                        <h4 className="font-medium text-forest-deep">
                          Maximum Security
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Military-grade encryption ensures your data is
                          protected
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-forest-deep/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-forest-deep" />
                      </div>
                      <div>
                        <h4 className="font-medium text-forest-deep">
                          Always Accessible
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Decentralized storage means your data is never lost
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-forest-deep/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-forest-deep" />
                      </div>
                      <div>
                        <h4 className="font-medium text-forest-deep">
                          Flexible Access
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Control who can access your content and when
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keep Types */}
            <div>
              <h2 className="text-2xl font-bold text-forest-deep mb-6">
                Keep Types
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {keepTypes.map((type, index) => (
                  <Card
                    key={index}
                    className="border-forest-deep/10 hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`w-12 h-12 ${type.bgColor} rounded-xl flex items-center justify-center mb-3`}
                      >
                        <type.icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <CardTitle className="text-lg text-forest-deep">
                        {type.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {type.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-forest-deep">
                          Examples:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {type.examples.map((example, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-forest-deep/30 rounded-full" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="border-forest-deep/10 hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div
                      className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-3`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg text-forest-deep">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* How It Works */}
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-2xl text-forest-deep">
                  How Keepr Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-forest-deep/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-forest-deep" />
                    </div>
                    <h3 className="font-semibold text-forest-deep mb-2">
                      1. Create & Encrypt
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Upload your content and set recipients. Everything is
                      encrypted with military-grade algorithms.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-forest-deep/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Database className="w-8 h-8 text-forest-deep" />
                    </div>
                    <h3 className="font-semibold text-forest-deep mb-2">
                      2. Store Securely
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Encrypted content is stored on IPFS, ensuring it's always
                      accessible and censorship-resistant.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-forest-deep/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-forest-deep" />
                    </div>
                    <h3 className="font-semibold text-forest-deep mb-2">
                      3. Controlled Access
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recipients can access content when conditions are met,
                      with full audit trail on the blockchain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <Card key={index} className="border-forest-deep/10">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-forest-deep/10 rounded-xl flex items-center justify-center mb-3">
                      <feature.icon className="w-6 h-6 text-forest-deep" />
                    </div>
                    <CardTitle className="text-lg text-forest-deep">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security Architecture */}
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-2xl text-forest-deep">
                  Security Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-deep mb-2">
                        Client-Side Encryption
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All encryption happens in your browser before any data
                        leaves your device. We never see your unencrypted
                        content.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-deep mb-2">
                        Zero-Knowledge Design
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Our servers cannot decrypt your content. Only you and
                        authorized recipients have the necessary keys to access
                        the data.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-deep mb-2">
                        Decentralized Storage
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Content is stored on IPFS, making it resistant to
                        censorship, server failures, and single points of
                        attack.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-2xl text-forest-deep">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium text-forest-deep">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {technicalSpecs.map((spec, index) => (
                <Card key={index} className="border-forest-deep/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-forest-deep">
                      {spec.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {spec.specs.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 bg-forest-deep/30 rounded-full mt-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* External Links */}
            <Card className="border-forest-deep/10">
              <CardHeader>
                <CardTitle className="text-2xl text-forest-deep">
                  Developer Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-forest-deep">
                      Smart Contracts
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://sepolia-blockscout.lisk.com/address/0x2F72BAeD02B119A64594aA4cad157707b8f85649#code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Contract Source Code
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://github.com/UbekM/kiipa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Repository
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-forest-deep">
                      Documentation
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="https://docs.lisk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <BookOpen className="w-4 h-4" />
                        Lisk Documentation
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://ipfs.io/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Database className="w-4 h-4" />
                        IPFS Documentation
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-forest-deep/10">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need help? Contact our support team or join our community.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Support
              </Button>
              <Button variant="outline" size="sm">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
              <Button variant="outline" size="sm">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
