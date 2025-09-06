import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DotMatrix from "@/components/dot-matrix";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, HardDrive, AlertTriangle } from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding-context";

interface KeyGenerationScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type KeyGenStep = "explanation" | "generating" | "complete";

export default function KeyGenerationScreen({ onBack, onComplete }: KeyGenerationScreenProps) {
  const [step, setStep] = useState<KeyGenStep>("explanation");
  const [progress, setProgress] = useState(0);
  const { generateZkKeys } = useOnboarding();

  const handleGenerateKeys = async () => {
    setStep("generating");
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("complete");
          setTimeout(() => {
            onComplete();
          }, 2000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      await generateZkKeys();
    } catch (error) {
      clearInterval(progressInterval);
      setStep("explanation");
    }
  };

  const getCurrentStep = () => {
    if (progress < 25) return { name: "Random Entropy Generated", status: "completed" };
    if (progress < 50) return { name: "Private Key Created", status: "completed" };
    if (progress < 75) return { name: "Public Key Deriving...", status: "current" };
    return { name: "Secure Storage", status: "pending" };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
          data-testid="button-back-keys"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-mono font-medium">Generate Privacy Keys</h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {step === "explanation" && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="flex space-x-1 mb-4 justify-center">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    zkETHer uses separate keys for privacy (different from your MetaMask keys)
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Lock className="w-5 h-5 text-accent" />
                      <span className="font-medium">Privacy Key Features:</span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-4 h-4 text-accent" />
                        <span>Receive private notes</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Shield className="w-4 h-4 text-accent" />
                        <span>Generate ZK proofs</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
                        <span>Unlinkable withdrawals</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <HardDrive className="w-4 h-4 text-accent" />
                        <span>Stored securely on device</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-destructive/20 border border-destructive/30 rounded-md">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Keep these keys safe!</span>
                      </div>
                      <p className="text-xs text-destructive/80 mt-1">
                        Lost keys = lost funds
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    className="flex-1 font-mono"
                    data-testid="button-backup-later"
                  >
                    BACKUP LATER
                  </Button>
                  <Button 
                    onClick={handleGenerateKeys}
                    className="flex-1 font-mono"
                    data-testid="button-generate-keys"
                  >
                    <div className="flex items-center space-x-2">
                      <DotMatrix pattern="header" size="sm" />
                      <span>GENERATE</span>
                      <DotMatrix pattern="header" size="sm" />
                    </div>
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <h3 className="font-mono font-medium">Generating Privacy Keys...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Progress: <span className="text-accent font-mono" data-testid="text-key-progress">
                    {Math.round(progress)}% Complete
                  </span>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-5 gap-2 mb-6">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-3 h-3 bg-white rounded-full"
                          animate={{
                            opacity: [0.4, 1, 0.4],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="text-left space-y-2">
                  <div className="text-sm font-medium">Current Step:</div>
                  <div className="space-y-1 ml-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-accent">✓ Random Entropy Generated</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-accent">✓ Private Key Created</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
                      <span className="text-xs text-accent">● Public Key Deriving...</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 border border-muted-foreground rounded-full"></div>
                      <span className="text-xs text-muted-foreground">○ Secure Storage</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Creating your privacy identity...</div>
                  <div className="text-sm text-accent font-mono">
                    Time remaining: ~{Math.max(1, Math.floor((100 - progress) / 30))} seconds
                  </div>
                </div>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                  <motion.div
                    className="text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  >
                    ✓
                  </motion.div>
                </div>

                <h3 className="font-mono font-medium text-accent">Privacy Keys Generated!</h3>
                
                <div className="flex space-x-1 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Your zkETHer privacy keys have been securely created and stored on your device.</p>
                  <p className="text-accent font-mono">Welcome to private transactions!</p>
                </div>

                <Button 
                  className="w-full font-mono"
                  onClick={onComplete}
                  data-testid="button-enter-app"
                >
                  <div className="flex items-center space-x-2">
                    <DotMatrix pattern="header" size="sm" />
                    <span>ENTER zkETHer</span>
                    <DotMatrix pattern="header" size="sm" />
                  </div>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}