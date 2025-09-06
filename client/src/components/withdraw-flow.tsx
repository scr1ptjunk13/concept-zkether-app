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
import { ArrowLeft, AlertTriangle, Shield } from "lucide-react";

interface WithdrawFlowProps {
  onClose: () => void;
}

type WithdrawStep = "note-selection" | "confirmation" | "zkproof" | "relayer" | "blockchain" | "complete";

interface MockNote {
  id: string;
  amount: number;
  received: string;
  privacySet: number;
  isRecommended: boolean;
}

export default function WithdrawFlow({ onClose }: WithdrawFlowProps) {
  const [step, setStep] = useState<WithdrawStep>("note-selection");
  const [selectedNote, setSelectedNote] = useState<MockNote | null>(null);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [progress, setProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");
  const [blockNumber, setBlockNumber] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock notes for demonstration
  const mockNotes: MockNote[] = [
    {
      id: "1",
      amount: 1.0,
      received: "2 days ago",
      privacySet: 47293,
      isRecommended: false
    },
    {
      id: "2", 
      amount: 1.0,
      received: "5 hours ago",
      privacySet: 47295,
      isRecommended: true
    }
  ];

  const withdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/withdrawals", {
        amount: selectedNote?.amount || 1.0,
        nullifierHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        proof: `0x${Math.random().toString(16).slice(2, 512)}`,
        recipient: withdrawalAddress
      });
      return response.json();
    },
    onSuccess: () => {
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["/api/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/privacy-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal.",
        variant: "destructive",
      });
    }
  });

  const handleContinue = () => {
    if (!selectedNote || !withdrawalAddress) {
      toast({
        title: "Invalid Selection",
        description: "Please select a note and enter withdrawal address.",
        variant: "destructive",
      });
      return;
    }
    setStep("confirmation");
  };

  const handleConfirmWithdrawal = () => {
    setStep("zkproof");
    
    // Generate mock data
    const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    const mockBlock = 18500000 + Math.floor(Math.random() * 1000);
    
    setTransactionHash(mockTxHash);
    setBlockNumber(mockBlock);
    
    // Simulate ZK proof generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("relayer");
          
          // Auto proceed to blockchain after relayer
          setTimeout(() => {
            setStep("blockchain");
            
            // Start withdrawal mutation
            withdrawalMutation.mutate();
          }, 3000);
          
          return 100;
        }
        return prev + Math.random() * 6;
      });
    }, 300);
  };

  const getCurrentZKStep = () => {
    if (progress < 15) return { current: "Merkle Path Construction", completed: [], pending: ["Merkle Path Construction", "Nullifier Generation", "Witness Generation", "Constraint Satisfaction", "Groth16 Proving", "Verification"] };
    if (progress < 30) return { current: "Nullifier Generation", completed: ["Merkle Path Construction"], pending: ["Nullifier Generation", "Witness Generation", "Constraint Satisfaction", "Groth16 Proving", "Verification"] };
    if (progress < 50) return { current: "Witness Generation (3/4)", completed: ["Merkle Path Construction", "Nullifier Generation"], pending: ["Witness Generation", "Constraint Satisfaction", "Groth16 Proving", "Verification"] };
    if (progress < 70) return { current: "Constraint Satisfaction", completed: ["Merkle Path Construction", "Nullifier Generation", "Witness Generation"], pending: ["Constraint Satisfaction", "Groth16 Proving", "Verification"] };
    if (progress < 90) return { current: "Groth16 Proving", completed: ["Merkle Path Construction", "Nullifier Generation", "Witness Generation", "Constraint Satisfaction"], pending: ["Groth16 Proving", "Verification"] };
    return { current: "Verification", completed: ["Merkle Path Construction", "Nullifier Generation", "Witness Generation", "Constraint Satisfaction", "Groth16 Proving"], pending: ["Verification"] };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" data-testid="modal-withdraw">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <AnimatePresence mode="wait">
            {step === "note-selection" && (
              <motion.div
                key="note-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-mono">Select Note to Withdraw</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClose}
                    data-testid="button-close-withdraw"
                  >
                    ×
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-4">
                      Available Notes: {mockNotes.length}
                    </div>
                    <div className="flex space-x-1 mb-4 justify-center">
                      <DotMatrix pattern="privacy" size="sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {mockNotes.map((note) => (
                      <Card 
                        key={note.id}
                        className={`cursor-pointer transition-colors ${
                          selectedNote?.id === note.id ? 'border-accent bg-accent/10' : 'hover:border-accent/50'
                        }`}
                        onClick={() => setSelectedNote(note)}
                        data-testid={`note-option-${note.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                              selectedNote?.id === note.id ? 'bg-accent border-accent' : 'border-muted-foreground'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Note #{note.id}</span>
                                {note.isRecommended && (
                                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded font-mono">
                                    ✓ RECOMMENDED
                                  </span>
                                )}
                              </div>
                              <div className="text-lg font-mono">{note.amount} ETH</div>
                              <div className="text-sm text-muted-foreground">Received: {note.received}</div>
                              <div className="text-xs text-muted-foreground">Privacy Set: {note.privacySet.toLocaleString()}</div>
                              <div className="flex space-x-1 mt-2">
                                <DotMatrix pattern="privacy" size="sm" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="withdrawal-address" className="text-muted-foreground">
                      Withdraw to Address:
                    </Label>
                    <Input
                      id="withdrawal-address"
                      placeholder="0x789def..."
                      value={withdrawalAddress}
                      onChange={(e) => setWithdrawalAddress(e.target.value)}
                      className="font-mono"
                      data-testid="input-withdrawal-address"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleContinue}
                    className="w-full font-mono"
                    disabled={!selectedNote || !withdrawalAddress}
                    data-testid="button-continue-withdraw"
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

            {step === "confirmation" && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep("note-selection")}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="font-mono">Confirm Withdrawal</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-1 justify-center mb-4">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Withdrawing Note #{selectedNote?.id}</h3>
                    <p className="text-lg font-mono">Amount: {selectedNote?.amount} ETH</p>
                    <p className="text-sm text-muted-foreground font-mono">To: {withdrawalAddress?.slice(0, 12)}...</p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-medium text-sm">Privacy Analysis:</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Anonymity Set:</span>
                          <span className="font-mono">{selectedNote?.privacySet.toLocaleString()} users</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Your Unlinkability:</span>
                          <span className="font-mono text-accent">99.998%</span>
                        </div>
                        <div className="flex space-x-1 justify-center">
                          <DotMatrix pattern="privacy" size="sm" />
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Estimated Time:</span>
                          <span className="font-mono">12 seconds</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Relayer Fee:</span>
                          <span className="font-mono">0.001 ETH</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-destructive/20 border border-destructive/30 rounded-md p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-destructive">This action cannot be undone</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="secondary" className="flex-1 font-mono" onClick={onClose}>
                      CANCEL
                    </Button>
                    <Button 
                      onClick={handleConfirmWithdrawal}
                      className="flex-1 font-mono"
                      data-testid="button-confirm-withdrawal"
                    >
                      <div className="flex items-center space-x-2">
                        <DotMatrix pattern="header" size="sm" />
                        <span>WITHDRAW</span>
                        <DotMatrix pattern="header" size="sm" />
                      </div>
                    </Button>
                  </div>
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
                  Progress: <span className="text-accent font-mono" data-testid="text-zkproof-progress">
                    {Math.round(progress)}% Complete
                  </span>
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    {/* Merkle tree visualization */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <div className="flex space-x-4">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="flex space-x-1">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className={`w-1 h-1 rounded-full ${i === 3 ? 'bg-accent' : 'bg-white'}`}
                            animate={i === 3 ? {
                              opacity: [0.4, 1, 0.4],
                              scale: [0.8, 1.4, 0.8]
                            } : {}}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: 0
                            }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">Your note position hidden</div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-left space-y-2 mb-4">
                  <div className="text-sm font-medium">Current Step:</div>
                  {getCurrentZKStep().completed.map((step, i) => (
                    <div key={i} className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-accent">✓ {step}</span>
                    </div>
                  ))}
                  {getCurrentZKStep().current && (
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
                      <span className="text-xs text-accent">● {getCurrentZKStep().current}</span>
                    </div>
                  )}
                  {getCurrentZKStep().pending.slice(1).map((step, i) => (
                    <div key={i} className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 border border-muted-foreground rounded-full"></div>
                      <span className="text-xs text-muted-foreground">○ {step}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-accent font-mono">
                    Time remaining: ~{Math.max(1, Math.floor((100 - progress) / 12))} seconds
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Privacy Status: Generating unlinkable proof for {selectedNote?.privacySet.toLocaleString()} user anonymity set...
                  </div>
                </div>
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
                
                <div className="text-sm text-accent mb-4">Proof Generated Successfully</div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    {/* Privacy flow visualization */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs">[Your Device]</span>
                          <DotMatrix pattern="header" size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <DotMatrix pattern="header" size="sm" />
                          <span className="text-xs">[Relayer]</span>
                          <DotMatrix pattern="header" size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <DotMatrix pattern="header" size="sm" />
                          <span className="text-xs">[zkETHer]</span>
                          <DotMatrix pattern="header" size="sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-2 text-sm">
                  <div>Relayer: zkether-relay-03</div>
                  <div className="text-muted-foreground">Status: Validating proof...</div>
                  <div className="text-muted-foreground">Fee: 0.001 ETH</div>
                  
                  <div className="pt-2 space-y-1">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-accent">Your identity: Protected</span>
                      <DotMatrix pattern="header" size="sm" />
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-accent">Transaction link: Broken</span>
                      <DotMatrix pattern="header" size="sm" />
                    </div>
                  </div>
                  
                  <div className="text-muted-foreground pt-2">
                    Estimated confirmation: 30s
                  </div>
                </div>
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
                <h3 className="font-mono font-medium mb-4">Transaction Broadcasting...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">Ethereum Network: Confirming</div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    <DotMatrix pattern="network" />
                  </CardContent>
                </Card>
                
                <div className="space-y-2 text-sm">
                  <div>Transaction Hash:</div>
                  <div className="font-mono text-xs text-accent break-all">{transactionHash}</div>
                  
                  <div className="pt-2 space-y-1">
                    <div className="text-muted-foreground">Block: #{blockNumber}</div>
                    <div className="text-muted-foreground">Confirmations: 1/3</div>
                  </div>
                </div>
                
                <Button variant="secondary" size="sm" className="font-mono mt-4">
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

                <h3 className="font-mono font-medium text-accent mb-4">Withdrawal Successful</h3>
                
                <div className="flex space-x-1 justify-center mb-4">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-lg font-mono text-accent">COMPLETE</div>
                    <div className="space-y-1">
                      <div className="font-medium">{selectedNote?.amount} ETH Withdrawn</div>
                      <div className="text-sm text-muted-foreground font-mono">To: {withdrawalAddress?.slice(0, 12)}...</div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <div className="font-medium">Privacy Achieved:</div>
                        <div className="text-xs text-muted-foreground">
                          Unlinkable from {selectedNote?.privacySet.toLocaleString()} possible deposits
                        </div>
                        <div className="flex space-x-1 justify-center pt-2">
                          <DotMatrix pattern="privacy" size="sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm space-y-2 mb-4">
                  <div className="font-medium">Updated Balance:</div>
                  <div className="text-accent font-mono">1.00 ETH UNLINKABLE</div>
                  <div className="text-xs text-muted-foreground">(1 note remaining)</div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <div>Transaction: {transactionHash.slice(0, 12)}...</div>
                  <div>Block: #{blockNumber}</div>
                  <div>Gas Used: 487,234</div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full font-mono">
                    VIEW TRANSACTION
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full font-mono">
                    WITHDRAW ANOTHER
                  </Button>
                  <Button onClick={onClose} className="w-full font-mono">
                    BACK TO HOME
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}