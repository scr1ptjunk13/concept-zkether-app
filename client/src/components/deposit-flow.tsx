import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DotMatrix from "./dot-matrix";
import { motion, AnimatePresence } from "framer-motion";

interface DepositFlowProps {
  onClose: () => void;
}

type DepositStep = "form" | "commitment" | "blockchain" | "complete";

export default function DepositFlow({ onClose }: DepositFlowProps) {
  const [step, setStep] = useState<DepositStep>("form");
  const [recipient, setRecipient] = useState("");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const depositMutation = useMutation({
    mutationFn: async (data: { recipient: string; amount: number; commitment: string }) => {
      const response = await apiRequest("POST", "/api/deposits", data);
      return response.json();
    },
    onSuccess: () => {
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      
      setTimeout(() => {
        onClose();
        toast({
          title: "Deposit Complete",
          description: "Your deposit has been committed to the mixer.",
        });
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!recipient) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid zkETHer public key.",
        variant: "destructive",
      });
      return;
    }

    setStep("commitment");
    
    // Simulate commitment generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("blockchain");
          
          // Start deposit mutation after commitment
          depositMutation.mutate({
            recipient,
            amount: 1.0,
            commitment: `0x${Math.random().toString(16).slice(2, 66)}`
          });
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" data-testid="modal-deposit">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-card border border-border rounded-lg max-w-md w-full"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono">Send ETH Privately</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    data-testid="button-close-deposit"
                  >
                    ×
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipient" className="text-muted-foreground">
                      To: Bob's zkETHer Key
                    </Label>
                    <div className="relative">
                      <Input
                        id="recipient"
                        placeholder="0x1a2b3c4d..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="font-mono"
                        data-testid="input-recipient"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <DotMatrix pattern="header" size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Amount: 1.00 ETH (Fixed)</Label>
                    <div className="bg-secondary border border-border rounded-md px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">1.00 ETH</span>
                        <DotMatrix pattern="header" size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="secondary" className="flex-1 font-mono" data-testid="button-qr-scan">
                      QR SCAN
                    </Button>
                    <Button variant="secondary" className="flex-1 font-mono" data-testid="button-contacts">
                      CONTACTS
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    className="w-full font-mono"
                    data-testid="button-continue-deposit"
                  >
                    <div className="flex items-center space-x-2">
                      <DotMatrix pattern="header" size="sm" />
                      <span>CONTINUE</span>
                      <DotMatrix pattern="header" size="sm" />
                    </div>
                  </Button>
                </CardContent>
              </motion.div>
            )}

            {step === "commitment" && (
              <motion.div
                key="commitment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium mb-4">Generating Commitment...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Poseidon Hash: <span className="text-accent font-mono" data-testid="text-hash-progress">
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 10 }).map((_, i) => (
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
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground mb-2">Creating note for recipient...</div>
                <div className="text-xs font-mono text-muted-foreground mb-4">
                  Nonce: 0x{Math.random().toString(16).slice(2, 8)}...
                </div>
                
                <div className="text-sm text-accent font-mono">Time remaining: ~3 seconds</div>
              </motion.div>
            )}

            {step === "blockchain" && (
              <motion.div
                key="blockchain"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium mb-4">Broadcasting Transaction...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">Ethereum Network: Confirming</div>
                
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <DotMatrix pattern="network" />
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground mb-2">Gas: 21,000 gwei</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Block: #{18500000 + Math.floor(Math.random() * 1000)}
                </div>
                
                <Button variant="secondary" size="sm" className="font-mono">
                  VIEW ON ETHERSCAN
                </Button>
              </motion.div>
            )}

            {step === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-6 text-center"
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <motion.div
                    className="text-2xl"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: 2 }}
                  >
                    ✓
                  </motion.div>
                </div>
                <h3 className="font-mono font-medium mb-2">Deposit Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your deposit has been committed to the mixer.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
