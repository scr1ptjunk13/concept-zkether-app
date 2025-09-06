import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DotMatrix from "./dot-matrix";
import { motion, AnimatePresence } from "framer-motion";

interface WithdrawFlowProps {
  onClose: () => void;
}

type WithdrawStep = "scanning" | "zkproof" | "relayer" | "complete";

export default function WithdrawFlow({ onClose }: WithdrawFlowProps) {
  const [step, setStep] = useState<WithdrawStep>("scanning");
  const [progress, setProgress] = useState(45);
  const [notesFound, setNotesFound] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const discoverNotesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/discover-notes", {});
      return response.json();
    },
    onSuccess: (data) => {
      setNotesFound(data.found);
      if (data.found > 0) {
        setTimeout(() => setStep("zkproof"), 1000);
      } else {
        toast({
          title: "No Notes Found",
          description: "No withdrawable notes were discovered.",
          variant: "destructive",
        });
        onClose();
      }
    }
  });

  const withdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/withdrawals", {
        amount: 1.0,
        nullifierHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        proof: `0x${Math.random().toString(16).slice(2, 512)}`,
        recipient: `0x${Math.random().toString(16).slice(2, 42)}`
      });
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
          title: "Withdrawal Complete",
          description: "Your withdrawal has been processed anonymously.",
        });
      }, 2000);
    }
  });

  const startZKProof = () => {
    setStep("zkproof");
    
    // Simulate ZK proof generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("relayer");
          withdrawalMutation.mutate();
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 800);
  };

  // Auto-start note discovery when component mounts
  useState(() => {
    discoverNotesMutation.mutate();
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" data-testid="modal-withdraw">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-card border border-border rounded-lg max-w-md w-full"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {step === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono">Scanning for Notes...</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    data-testid="button-close-withdraw"
                  >
                    ×
                  </Button>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex space-x-1 mb-4 justify-center">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    Checking {1247 + Math.floor(Math.random() * 100)} deposits
                  </div>
                  
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center space-y-1">
                            <motion.div
                              className="w-2 h-2 bg-white rounded-full"
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
                            <div className={`text-xs ${i === 2 ? 'text-accent' : 'text-red-400'}`}>
                              {i === 2 ? '✓' : '✗'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {discoverNotesMutation.isSuccess && (
                    <>
                      <div className="text-sm text-accent mb-2" data-testid="text-notes-found">
                        Found: {notesFound} note{notesFound !== 1 ? 's' : ''} (1.00 ETH)
                      </div>
                      <div className="text-xs text-muted-foreground mb-4">
                        Position: #{Math.floor(Math.random() * 100) + 1} in tree
                      </div>
                      
                      <Button 
                        onClick={startZKProof}
                        className="w-full font-mono"
                        data-testid="button-generate-proof"
                      >
                        GENERATE ZK PROOF
                      </Button>
                    </>
                  )}
                  
                  {discoverNotesMutation.isPending && (
                    <div className="text-sm text-accent font-mono">Scanning...</div>
                  )}
                </CardContent>
              </motion.div>
            )}

            {step === "zkproof" && (
              <motion.div
                key="zkproof"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium mb-4">Generating Zero-Knowledge Proof</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Merkle Path: <span className="text-accent font-mono" data-testid="text-merkle-progress">
                    {Math.round(progress)}%
                  </span>
                </div>
                
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <DotMatrix pattern="merkle" />
                  </CardContent>
                </Card>
                
                <div className="text-left space-y-2 mb-4">
                  <div className="text-sm">Current Step:</div>
                  <div className="text-xs text-accent ml-4">● Witness Generation (3/4)</div>
                  <div className="text-xs text-muted-foreground ml-4">● Constraint Satisfaction</div>
                  <div className="text-xs text-muted-foreground ml-4">● Groth16 Proving...</div>
                </div>
                
                <div className="text-sm text-accent font-mono mb-2">
                  Time remaining: ~{Math.max(1, Math.floor((100 - progress) / 10))} seconds
                </div>
                <div className="text-xs text-muted-foreground">Privacy Level: 47,293 users</div>
              </motion.div>
            )}

            {step === "relayer" && (
              <motion.div
                key="relayer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium mb-4">Submitting via Relayer...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">Breaking transaction links</div>
                
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center space-x-2 text-xs">
                      <span>[You]</span>
                      <DotMatrix pattern="header" size="sm" />
                      <span>[Relayer]</span>
                      <DotMatrix pattern="header" size="sm" />
                      <span>[Contract]</span>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Relayer: zkether-relay-01
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Fee: 0.001 ETH
                </div>
                
                <div className="text-sm text-accent">
                  Your identity: Protected <DotMatrix pattern="header" size="sm" />
                </div>
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
                <h3 className="font-mono font-medium mb-2">Withdrawal Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your withdrawal has been processed anonymously.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
