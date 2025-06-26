import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Clock,
  Users,
  Lock,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Globe,
  Zap,
  ChevronLeft,
  Star,
  Sparkles,
} from "lucide-react";
import { WalletConnection } from "@/components/wallet/WalletConnection";
import {
  useWeb3ModalAccount,
  useWeb3ModalProvider,
} from "@web3modal/ethers/react";
import { getEncryptionKeysForAddress } from "@/lib/encryption";
import { useToast } from "@/components/ui/use-toast";

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to Keepr",
    subtitle: "Your Digital Legacy, Secured Forever",
    description: "Decentralized inheritance protocol powered by blockchain",
    icon: Shield,
    gradient: "from-emerald-50 to-green-50",
    content: (
      <div className="space-y-8">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-forest-deep to-pine-fade rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-800" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-forest-deep leading-tight">
              Protect What
              <br />
              <span className="bg-gradient-to-r from-forest-deep to-pine-fade bg-clip-text text-transparent">
                Matters Most
              </span>
            </h1>
            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Secure your digital assets, secrets, and documents with trustless,
              decentralized inheritance powered by blockchain technology.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-10 h-10 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-forest-deep">
                End-to-End Encrypted
              </p>
              <p className="text-xs text-muted-foreground">
                Military-grade encryption before storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-10 h-10 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-forest-deep">
                Decentralized Storage
              </p>
              <p className="text-xs text-muted-foreground">
                Distributed across IPFS network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-10 h-10 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-forest-deep">
                Smart Inheritance
              </p>
              <p className="text-xs text-muted-foreground">
                Automatic unlocking with inactivity detection
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-it-works",
    title: "How It Works",
    subtitle: "Simple, Secure, Trustless",
    description: "Three steps to secure your digital legacy",
    icon: Zap,
    gradient: "from-blue-50 to-indigo-50",
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-forest-deep mb-2">
            Three Simple Steps
          </h2>
          <p className="text-muted-foreground">
            Getting started takes less than 5 minutes
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-deep to-pine-fade text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-forest-deep mb-1">Create a Keep</h3>
              <p className="text-sm text-muted-foreground">
                Upload and encrypt your secrets, documents, or digital assets
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-deep to-pine-fade text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-forest-deep mb-1">
                Set Recipients
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose who can access your Keep and when they can claim it
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-deep to-pine-fade text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-forest-deep mb-1">Stay Active</h3>
              <p className="text-sm text-muted-foreground">
                Regular check-ins prevent accidental inheritance activation
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "features",
    title: "Powerful Features",
    subtitle: "Built for the Future",
    description: "Everything you need for digital inheritance",
    icon: CheckCircle,
    gradient: "from-purple-50 to-pink-50",
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-forest-deep mb-2">
            Built for Everyone
          </h2>
          <p className="text-muted-foreground">Advanced features made simple</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-12 h-12 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-touch" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-forest-deep">
                Multiple Keep Types
              </p>
              <p className="text-xs text-muted-foreground">
                Secrets, docs, keys, inheritance
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-12 h-12 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-touch" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-forest-deep">
                Multi Recipients
              </p>
              <p className="text-xs text-muted-foreground">
                Primary & fallback options
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-12 h-12 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-emerald-touch" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-forest-deep">
                Custom Timing
              </p>
              <p className="text-xs text-muted-foreground">
                Flexible inactivity periods
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 p-4 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40">
            <div className="w-12 h-12 bg-emerald-touch/10 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-touch" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-forest-deep">
                Mobile PWA
              </p>
              <p className="text-xs text-muted-foreground">
                Works offline, installs natively
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-emerald-touch/10 to-pine-fade/10 border border-emerald-touch/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-emerald-touch" />
            <p className="text-sm font-semibold text-emerald-touch">
              Powered by Lisk Blockchain
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Built on a secure, scalable blockchain for transparency and trust
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "connect",
    title: "Connect Wallet",
    subtitle: "One Step Away",
    description: "Connect to start securing your digital legacy",
    icon: Shield,
    gradient: "from-green-50 to-emerald-50",
    content: (
      <div className="space-y-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-forest-deep to-pine-fade rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-800" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-forest-deep">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Connect your wallet to begin creating your first Keep and securing
            your digital legacy
          </p>
        </div>

        <div className="p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-forest-deep" />
            <p className="text-sm font-semibold text-forest-deep">
              Supported Networks
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20"
            >
              Lisk Mainnet
            </Badge>
            <Badge
              variant="secondary"
              className="bg-emerald-touch/10 text-emerald-touch border-emerald-touch/20"
            >
              Lisk Sepolia
            </Badge>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { isConnected } = useWeb3ModalAccount();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (currentStep === onboardingSteps.length - 1 && isConnected) {
      navigate("/dashboard");
    }
  }, [currentStep, isConnected, navigate]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isConnected) {
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(onboardingSteps.length - 1);
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="app-container">
      <div className="mobile-page">
        {/* Native-style header */}
        <div className="mobile-header">
          <div className="flex items-center justify-between mobile-spacing-tight">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl p-2"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <div className="flex-1 flex justify-center">
              <div className="progress-dots">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`progress-dot ${
                      index <= currentStep ? "active" : "inactive"
                    }`}
                  />
                ))}
              </div>
            </div>

            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:bg-forest-deep/5 rounded-xl px-3 py-2 text-sm"
              >
                Skip
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mobile-content">
          <div
            className={`min-h-full bg-gradient-to-br ${step.gradient} relative overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20" />

            <div
              className={`relative z-10 mobile-spacing transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-forest-deep mb-1">
                  {step.title}
                </h1>
                <p className="text-lg font-semibold text-pine-fade mb-2">
                  {step.subtitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>

              {/* Step content */}
              <div className="mb-8">{step.content}</div>

              {/* Wallet Connection on Last Step */}
              {isLastStep && (
                <div className="flex justify-center mb-6">
                  <WalletConnection />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={handleNext}
                  disabled={isLastStep && !isConnected}
                  className="btn-native w-full flex items-center justify-center gap-3 text-base font-semibold"
                  size="lg"
                >
                  {isLastStep ? (
                    isConnected ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Enter Keepr
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Connect to Continue
                      </>
                    )
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mobile-spacing-tight bg-white/50 backdrop-blur-md border-t border-white/40">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Secure • 🌐 Decentralized • ⚡ Trustless
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FallbackSetup() {
  const { address } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { toast } = useToast();

  const handleSetup = async () => {
    try {
      await getEncryptionKeysForAddress(address!);
      toast({
        title: "Encryption Key Created",
        description: "Your fallback encryption key is now set up!",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set up fallback key.",
      });
    }
  };

  return (
    <div>
      <h2>Setup as Fallback</h2>
      <p>
        You have been added as a fallback recipient. Click below to set up your
        encryption key so you can access keeps if needed.
      </p>
      <button onClick={handleSetup}>Setup Fallback Key</button>
    </div>
  );
}
