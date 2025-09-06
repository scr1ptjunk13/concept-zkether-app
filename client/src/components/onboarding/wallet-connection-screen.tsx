import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DotMatrix from "@/components/dot-matrix";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useOnboarding } from "@/contexts/onboarding-context";

interface WalletConnectionScreenProps {
  onBack: () => void;
  onConnected: () => void;
}

type ConnectionStep = "select" | "connecting" | "connected";

export default function WalletConnectionScreen({ onBack, onConnected }: WalletConnectionScreenProps) {
  const [step, setStep] = useState<ConnectionStep>("select");
  const [selectedWallet, setSelectedWallet] = useState<string>("");
  const { connectWallet, walletAddress, walletBalance } = useOnboarding();

  const handleWalletSelect = async (walletType: string) => {
    setSelectedWallet(walletType);
    setStep("connecting");
    
    try {
      await connectWallet(walletType);
      setStep("connected");
      setTimeout(() => {
        onConnected();
      }, 2000);
    } catch (error) {
      setStep("select");
    }
  };

  const walletOptions = [
    {
      id: "metamask",
      name: "MetaMask Mobile",
      icon: "📱",
      description: "Most popular wallet",
      testId: "button-metamask"
    },
    {
      id: "rainbow",
      name: "Rainbow Wallet", 
      icon: "🌈",
      description: "Beautiful & secure",
      testId: "button-rainbow"
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗", 
      description: "Other wallets",
      testId: "button-walletconnect"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="mr-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="font-mono font-medium">Connect Your Wallet</h2>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div
                key="select"
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
                    zkETHer needs access to your Ethereum wallet for deposits
                  </p>
                </div>

                <div className="space-y-4">
                  {walletOptions.map((wallet) => (
                    <Card 
                      key={wallet.id} 
                      className="cursor-pointer hover:bg-secondary transition-colors duration-200"
                      onClick={() => handleWalletSelect(wallet.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{wallet.icon}</div>
                            <div>
                              <div className="font-medium">{wallet.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {wallet.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <DotMatrix pattern="header" size="sm" />
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-3 font-mono"
                          data-testid={wallet.testId}
                        >
                          CONNECT {wallet.name.split(' ')[0].toUpperCase()}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "connecting" && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <h3 className="font-mono font-medium">Connecting to {selectedWallet}...</h3>
                
                <div className="flex space-x-1 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Please approve in {selectedWallet}
                </p>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-2xl">📱 {selectedWallet}</div>
                    
                    <div className="text-sm space-y-2">
                      <p className="font-medium">zkETHer wants to connect</p>
                      
                      <div className="text-left space-y-1">
                        <p className="text-xs text-muted-foreground">Permissions requested:</p>
                        <p className="text-xs">• View account address</p>
                        <p className="text-xs">• Request transaction approval</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" className="flex-1">CANCEL</Button>
                      <Button size="sm" className="flex-1">CONNECT</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>This allows zkETHer to:</p>
                  <p>✓ Show your ETH balance</p>
                  <p>✓ Request deposit transactions</p>
                  <p>✗ Never access your private keys or move funds without your approval</p>
                </div>
              </motion.div>
            )}

            {step === "connected" && (
              <motion.div
                key="connected"
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

                <h3 className="font-mono font-medium text-accent">Wallet Connected</h3>
                
                <div className="flex space-x-1 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>

                <Card>
                  <CardContent className="p-4 space-y-2">
                    <div className="text-lg font-mono text-accent">SUCCESS</div>
                    <div className="text-sm">Connected to {selectedWallet}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Address: {walletAddress?.slice(0, 8)}...
                    </div>
                    <div className="text-sm font-mono" data-testid="text-wallet-balance">
                      Balance: {walletBalance} ETH
                    </div>
                    <div className="pt-2">
                      <DotMatrix pattern="header" size="sm" />
                    </div>
                  </CardContent>
                </Card>

                <div className="text-sm text-muted-foreground">
                  Next: Generate your zkETHer privacy keys
                </div>

                <Button 
                  className="w-full font-mono"
                  onClick={onConnected}
                  data-testid="button-continue-connected"
                >
                  <div className="flex items-center space-x-2">
                    <DotMatrix pattern="header" size="sm" />
                    <span>CONTINUE</span>
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