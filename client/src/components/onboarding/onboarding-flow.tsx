import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeScreen from "./welcome-screen";
import WalletConnectionScreen from "./wallet-connection-screen";
import KeyGenerationScreen from "./key-generation-screen";

type OnboardingStep = "welcome" | "wallet" | "keys";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");

  const handleGetStarted = () => {
    setStep("wallet");
  };

  const handleWalletConnected = () => {
    setStep("keys");
  };

  const handleKeysGenerated = () => {
    onComplete();
  };

  const handleSkip = () => {
    // For now, skip goes directly to app
    onComplete();
  };

  const handleBack = () => {
    if (step === "wallet") {
      setStep("welcome");
    } else if (step === "keys") {
      setStep("wallet");
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="onboarding-flow">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen 
              onGetStarted={handleGetStarted}
              onSkip={handleSkip}
            />
          </motion.div>
        )}

        {step === "wallet" && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <WalletConnectionScreen 
              onBack={handleBack}
              onConnected={handleWalletConnected}
            />
          </motion.div>
        )}

        {step === "keys" && (
          <motion.div
            key="keys"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <KeyGenerationScreen 
              onBack={handleBack}
              onComplete={handleKeysGenerated}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}