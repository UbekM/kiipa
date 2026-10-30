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
    title: "Keepr",
    subtitle: "Encrypted keeps for the people you trust.",
    description: "",
    icon: Shield,
    content: (
      <div className="space-y-10">
        <div className="text-center space-y-6 animate-fade-up">
          <p className="font-display text-display-lg text-forest-deep">
            Keepr
          </p>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto leading-relaxed animate-fade-up-delay">
            Encrypted keeps for the people you trust.
          </p>
        </div>

        <div className="space-y-3 animate-fade-up-delay-2">
          <div className="flex items-center gap-4 px-1 py-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-forest-deep">
                End-to-end encrypted
              </p>
              <p className="text-xs text-muted-foreground">
                Secrets leave your device already locked
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-1 py-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-forest-deep">
                Decentralized storage
              </p>
              <p className="text-xs text-muted-foreground">
                Stored on IPFS, settled on Lisk
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-1 py-3">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-touch" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-forest-deep">
                Timed inheritance
              </p>
              <p className="text-xs text-muted-foreground">
                Unlock when you choose — not before
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-it-works",
    title: "How it works",
    subtitle: "Three calm steps",
    description: "Secure a keep in minutes",
    icon: Zap,
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 bg-forest-deep rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-display-sm text-forest-deep mb-2">
            Three simple steps
          </h2>
          <p className="text-muted-foreground text-sm">
            Getting started takes less than five minutes
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              n: "1",
              title: "Create a Keep",
              body: "Encrypt secrets, documents, or keys before they leave your device",
            },
            {
              n: "2",
              title: "Set recipients",
              body: "Choose who can claim — and when — with an optional fallback",
            },
            {
              n: "3",
              title: "Stay in control",
              body: "Your unlock schedule keeps inheritance intentional",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="flex gap-4 p-4 bg-card border border-border/70 rounded-2xl"
            >
              <div className="w-9 h-9 bg-forest-deep text-white rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                {step.n}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-forest-deep mb-0.5">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "features",
    title: "Built for trust",
    subtitle: "Clear tools, quiet confidence",
    description: "Everything you need for digital inheritance",
    icon: CheckCircle,
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-touch rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-display text-display-sm text-forest-deep mb-2">
            Built for everyone
          </h2>
          <p className="text-muted-foreground text-sm">
            Advanced protection, simple interface
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Shield,
              title: "Multiple keep types",
              body: "Secrets, docs, keys, inheritance",
            },
            {
              icon: Users,
              title: "Multi recipients",
              body: "Primary & fallback options",
            },
            {
              icon: Clock,
              title: "Custom timing",
              body: "Flexible unlock windows",
            },
            {
              icon: Smartphone,
              title: "Mobile PWA",
              body: "Install and use anywhere",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-3 p-4 bg-card border border-border/70 rounded-2xl text-center"
            >
              <div className="w-11 h-11 bg-secondary rounded-xl flex items-center justify-center">
                <item.icon className="w-5 h-5 text-emerald-touch" />
              </div>
              <div>
                <p className="font-semibold text-sm text-forest-deep">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-secondary/80 border border-border/60 rounded-2xl">
          <p className="text-sm font-semibold text-forest-deep mb-1">
            Powered by Lisk
          </p>
          <p className="text-xs text-muted-foreground">
            Transparent settlement on a secure, scalable blockchain
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "connect",
    title: "Connect wallet",
    subtitle: "One step away",
    description: "Connect to start securing your digital legacy",
    icon: Shield,
    content: (
      <div className="space-y-8 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-forest-deep to-pine-fade rounded-3xl flex items-center justify-center mx-auto shadow-soft">
          <Shield className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-display-sm text-forest-deep">
            Ready to begin?
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
            Connect your wallet to create your first Keep and secure your
            digital legacy.
          </p>
        </div>

        <div className="p-5 bg-card border border-border/70 rounded-2xl">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-forest-deep" />
            <p className="text-sm font-semibold text-forest-deep">
              Supported networks
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-2">
            <Badge
              variant="secondary"
              className="bg-secondary text-forest-deep border-transparent"
            >
              Lisk Mainnet
            </Badge>
            <Badge
              variant="secondary"
              className="bg-secondary text-forest-deep border-transparent"
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
  const isFirstStep = currentStep === 0;

  return (
    <div className="app-container">
      <div className="mobile-page">
        <div className="mobile-header bg-transparent border-transparent backdrop-blur-none">
          <div className="flex items-center justify-between mobile-spacing-tight">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="touch-target text-forest-deep hover:bg-forest-deep/5 rounded-xl p-2"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <div className="w-10" />
            )}

            <div className="flex-1 flex justify-center">
              <div className="progress-dots" role="tablist" aria-label="Onboarding progress">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`progress-dot ${
                      index <= currentStep ? "active" : "inactive"
                    }`}
                    aria-current={index === currentStep ? "step" : undefined}
                  />
                ))}
              </div>
            </div>

            {!isLastStep ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:bg-forest-deep/5 hover:text-forest-deep rounded-xl px-3 py-2 text-sm"
              >
                Skip
              </Button>
            ) : (
              <div className="w-12" />
            )}
          </div>
        </div>

        <div className="mobile-content">
          <div
            className={`min-h-full relative overflow-hidden ${
              isFirstStep ? "hero-atmosphere" : "page-shell"
            }`}
          >
            <div
              className={`relative z-10 mobile-spacing transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {!isFirstStep && (
                <div className="text-center mb-8">
                  <h1 className="font-display text-display-sm text-forest-deep mb-1">
                    {step.title}
                  </h1>
                  <p className="text-base font-medium text-pine-fade mb-1">
                    {step.subtitle}
                  </p>
                  {step.description && (
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-8">{step.content}</div>

              {isLastStep && (
                <div className="flex justify-center mb-6">
                  <WalletConnection />
                </div>
              )}

              <div className="pt-2 pb-4">
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
                        Connect to continue
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

        <div className="mobile-spacing-tight border-t border-border/60 bg-card/60 backdrop-blur-md">
          <p className="text-center text-xs text-muted-foreground tracking-wide">
            Secure · Decentralized · Trustless
          </p>
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
