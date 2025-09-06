import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/contexts/onboarding-context";
import DotMatrix from "./dot-matrix";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, Lock, QrCode, MessageSquare, Copy, Mail, Link, Clock } from "lucide-react";

interface DepositFlowProps {
  onClose: () => void;
}

type DepositStep = "form" | "confirmation" | "commitment" | "wallet-approval" | "blockchain" | "confirmed" | "share-note" | "complete";

export default function DepositFlow({ onClose }: DepositFlowProps) {
  const [step, setStep] = useState<DepositStep>("form");
  const [recipient, setRecipient] = useState("");
  const [progress, setProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");
  const [blockNumber, setBlockNumber] = useState(0);
  const [leafIndex, setLeafIndex] = useState(0);
  const [nonce, setNonce] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { walletType, walletAddress, walletBalance } = useOnboarding();

  const depositMutation = useMutation({
    mutationFn: async (data: { recipient: string; amount: number; commitment: string }) => {
      // Simulate deposit processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, id: Math.random().toString(36) };
    },
    onSuccess: () => {
      setStep("confirmed");
    },
    onError: () => {
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit.",
        variant: "destructive",
      });
    }
  });

  const handleContinue = () => {
    if (!recipient) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid zkETHer public key.",
        variant: "destructive",
      });
      return;
    }
    setStep("confirmation");
  };

  const handleConfirmDeposit = () => {
    setStep("commitment");
    
    // Generate mock data
    const mockNonce = `0x${Math.random().toString(16).slice(2, 16)}`;
    const mockTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    const mockBlock = 18500000 + Math.floor(Math.random() * 1000);
    const mockLeaf = 47296 + Math.floor(Math.random() * 100);
    
    setNonce(mockNonce);
    setTransactionHash(mockTxHash);
    setBlockNumber(mockBlock);
    setLeafIndex(mockLeaf);
    
    // Simulate commitment generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("wallet-approval");
          
          // Auto proceed to blockchain after wallet approval simulation
          setTimeout(() => {
            setStep("blockchain");
            
            // Start deposit mutation
            depositMutation.mutate({
              recipient,
              amount: 1.0,
              commitment: `0x${Math.random().toString(16).slice(2, 66)}`
            });
          }, 3000);
          
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 200);
  };

  const getCurrentCommitmentStep = () => {
    if (progress < 25) return { current: "Random Nonce Generated", completed: ["Random Nonce Generated"], pending: ["Note Construction", "Poseidon Hash Computing...", "Commitment Finalization"] };
    if (progress < 50) return { current: "Note Construction", completed: ["Random Nonce Generated", "Note Construction"], pending: ["Poseidon Hash Computing...", "Commitment Finalization"] };
    if (progress < 75) return { current: "Poseidon Hash Computing...", completed: ["Random Nonce Generated", "Note Construction", "Poseidon Hash Computing..."], pending: ["Commitment Finalization"] };
    return { current: "Commitment Finalization", completed: ["Random Nonce Generated", "Note Construction", "Poseidon Hash Computing...", "Commitment Finalization"], pending: [] };
  };

  const handleShareNote = () => {
    setStep("complete");
    setTimeout(() => {
      onClose();
      toast({
        title: "Deposit Complete",
        description: "Your deposit has been committed to the mixer.",
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" data-testid="modal-deposit">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
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
                      Send to:
                    </Label>
                    <div className="relative">
                      <Input
                        id="recipient"
                        placeholder="Bob's zkETHer Public Key (0x1a2b3c4d...)"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="font-mono text-sm"
                        data-testid="input-recipient"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <DotMatrix pattern="header" size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" className="flex-1 font-mono text-xs" data-testid="button-qr-scan">
                      <QrCode className="w-3 h-3 mr-1" />
                      QR SCAN
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 font-mono text-xs" data-testid="button-contacts">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      CONTACTS
                    </Button>
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
                  
                  <div>
                    <Label className="text-muted-foreground">From Wallet:</Label>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{walletType} ({walletAddress?.slice(0, 8)}...)</div>
                            <div className="text-xs text-muted-foreground font-mono">Balance: {walletBalance} ETH</div>
                          </div>
                          <span className="text-xs">📱</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="bg-destructive/20 border border-destructive/30 rounded-md p-3">
                    <div className="text-sm space-y-1">
                      <div className="font-medium">Privacy Notice:</div>
                      <div className="flex items-center space-x-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-destructive" />
                        <span>This deposit will be PUBLIC</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <Lock className="w-3 h-3 text-accent" />
                        <span>Withdrawal will be UNLINKABLE</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleContinue}
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
                    <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="font-mono">Confirm Deposit</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-1 justify-center mb-4">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="font-medium">Creating Private Note</h3>
                    <p className="text-sm text-muted-foreground">For: Bob ({recipient?.slice(0, 12)}...)</p>
                    <p className="text-lg font-mono">Amount: 1.00 ETH</p>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-medium text-sm">Transaction Details:</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gas Fee:</span>
                          <span className="font-mono">~0.003 ETH</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Cost:</span>
                          <span className="font-mono">1.003 ETH</span>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs space-y-1">
                          <p className="font-medium">Your deposit will be:</p>
                          <p>✓ Added to privacy pool</p>
                          <p>✓ Visible on blockchain</p>
                          <p>✓ Unlinkable when withdrawn</p>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-xs space-y-1">
                          <p className="font-medium">Current Anonymity Set:</p>
                          <p className="font-mono">47,293 users</p>
                          <div className="flex space-x-1">
                            <DotMatrix pattern="privacy" size="sm" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex space-x-3">
                    <Button variant="secondary" className="flex-1 font-mono" onClick={onClose}>
                      CANCEL
                    </Button>
                    <Button 
                      onClick={handleConfirmDeposit}
                      className="flex-1 font-mono"
                      data-testid="button-confirm-deposit"
                    >
                      <div className="flex items-center space-x-2">
                        <DotMatrix pattern="header" size="sm" />
                        <span>DEPOSIT</span>
                        <DotMatrix pattern="header" size="sm" />
                      </div>
                    </Button>
                  </div>
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
                  Progress: <span className="text-accent font-mono" data-testid="text-commitment-progress">
                    {Math.round(progress)}% Complete
                  </span>
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-white rounded-full"
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
                
                <div className="text-left space-y-2 mb-4">
                  <div className="text-sm font-medium">Current Step:</div>
                  {getCurrentCommitmentStep().completed.map((step, i) => (
                    <div key={i} className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span className="text-xs text-accent">✓ {step}</span>
                    </div>
                  ))}
                  {getCurrentCommitmentStep().current && (
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 bg-accent rounded-full pulse-dot"></div>
                      <span className="text-xs text-accent">● {getCurrentCommitmentStep().current}</span>
                    </div>
                  )}
                  {getCurrentCommitmentStep().pending.map((step, i) => (
                    <div key={i} className="flex items-center space-x-2 ml-4">
                      <div className="w-2 h-2 border border-muted-foreground rounded-full"></div>
                      <span className="text-xs text-muted-foreground">○ {step}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Creating note for Bob...</div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Nonce: {nonce}... <DotMatrix pattern="header" size="sm" />
                  </div>
                  <div className="text-sm text-accent font-mono">
                    Time remaining: ~{Math.max(1, Math.floor((100 - progress) / 40))} seconds
                  </div>
                </div>
              </motion.div>
            )}

            {step === "wallet-approval" && (
              <motion.div
                key="wallet-approval"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium mb-4">Approve in Wallet...</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-accent mb-4">Commitment Generated ✓</div>

                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-lg">📱 {walletType}</div>
                    <div className="text-sm font-medium">zkETHer Deposit</div>
                    <div className="space-y-1 text-xs">
                      <div>To: 0x...contract</div>
                      <div>Amount: 1.00 ETH</div>
                      <div>Gas: 0.003 ETH</div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Data: {nonce}...
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button variant="secondary" size="sm" className="flex-1">REJECT</Button>
                      <Button size="sm" className="flex-1">CONFIRM</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Waiting for wallet approval...</p>
                  <p className="text-xs">Note: This transaction will be publicly visible on Ethereum</p>
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
                
                <div className="space-y-2 text-sm">
                  <div>Transaction Hash:</div>
                  <div className="font-mono text-xs text-accent break-all">{transactionHash}</div>
                  
                  <div className="pt-2 space-y-1">
                    <div className="text-muted-foreground">Status: Pending...</div>
                    <div className="text-muted-foreground">Block: Waiting for inclusion</div>
                    <div className="text-muted-foreground">Confirmations: 0/3</div>
                  </div>
                </div>
                
                <Button variant="secondary" size="sm" className="font-mono mt-4">
                  VIEW ON ETHERSCAN
                </Button>
              </motion.div>
            )}

            {step === "confirmed" && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="p-6 text-center"
              >
                <h3 className="font-mono font-medium text-accent mb-4">Transaction Confirmed ✓</h3>
                
                <div className="flex space-x-1 mb-4 justify-center">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">Added to zkETHer Pool</div>

                <Card className="mb-4">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="font-mono text-xs">Commitment: {nonce}...</div>
                    <div>Leaf Index: #{leafIndex}</div>
                    <div>Block: #{blockNumber}</div>
                    
                    <div className="pt-2 border-t">
                      <div className="font-medium">Privacy Pool Status:</div>
                      <div>Total Deposits: {leafIndex}</div>
                      <div>Anonymity Set: +1 user</div>
                      <div className="flex space-x-1 justify-center pt-2">
                        <DotMatrix pattern="privacy" size="sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground mb-4">
                  Next Step: Share note with Bob
                </div>
                
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full font-mono">
                    VIEW TRANSACTION
                  </Button>
                  <Button 
                    onClick={() => setStep("share-note")}
                    className="w-full font-mono"
                    data-testid="button-share-note"
                  >
                    SHARE NOTE
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full font-mono" onClick={onClose}>
                    BACK TO HOME
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "share-note" && (
              <motion.div
                key="share-note"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setStep("confirmed")}>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="font-mono">Share Note with Bob</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-1 justify-center mb-4">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Bob needs this information to discover the note:
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="font-mono text-sm space-y-1">
                        <div>Amount: 1.00 ETH</div>
                        <div>Nonce: {nonce}</div>
                        <div>Leaf Index: #{leafIndex}</div>
                      </div>
                      
                      <div className="bg-destructive/20 border border-destructive/30 rounded-md p-2 mt-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">KEEP THIS PRIVATE</span>
                        </div>
                        <p className="text-xs text-destructive/80 mt-1">
                          Only share via secure channels (Signal, etc.)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div>
                    <Label className="text-muted-foreground mb-2 block">Sharing Options:</Label>
                    <div className="space-y-2">
                      <Button variant="secondary" className="w-full justify-start font-mono text-sm" data-testid="button-share-signal">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send via Signal
                      </Button>
                      <Button variant="secondary" className="w-full justify-start font-mono text-sm" data-testid="button-share-email">
                        <Mail className="w-4 h-4 mr-2" />
                        Encrypted Email
                      </Button>
                      <Button variant="secondary" className="w-full justify-start font-mono text-sm" data-testid="button-share-copy">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                      <Button variant="secondary" className="w-full justify-start font-mono text-sm" data-testid="button-share-link">
                        <Link className="w-4 h-4 mr-2" />
                        Generate Secure Link
                      </Button>
                      <Button variant="secondary" className="w-full justify-start font-mono text-sm" data-testid="button-share-auto-delete">
                        <Clock className="w-4 h-4 mr-2" />
                        Auto-delete after 24h
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button variant="ghost" className="flex-1 font-mono" onClick={handleShareNote}>
                      SKIP FOR NOW
                    </Button>
                    <Button 
                      onClick={handleShareNote}
                      className="flex-1 font-mono"
                      data-testid="button-share-confirm"
                    >
                      SHARE
                    </Button>
                  </div>
                </CardContent>
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

                <h3 className="font-mono font-medium text-accent mb-4">Deposit Successful</h3>
                
                <div className="flex space-x-1 justify-center mb-4">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>

                <Card className="mb-4">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-lg font-mono text-accent">COMPLETE</div>
                    <div className="space-y-1">
                      <div className="font-medium">1.00 ETH Deposited</div>
                      <div className="text-sm text-muted-foreground">For: Bob</div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <div className="font-medium">Privacy Status:</div>
                        <div className="text-xs text-muted-foreground">Added to anonymity set of {leafIndex} users</div>
                        <div className="flex space-x-1 justify-center pt-2">
                          <DotMatrix pattern="privacy" size="sm" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-sm text-muted-foreground space-y-2 mb-4">
                  <div className="font-medium">What happens next:</div>
                  <div className="text-xs text-left space-y-1">
                    <div>• Bob's app will scan deposits</div>
                    <div>• Trial decryption will find your note automatically</div>
                    <div>• Bob can withdraw unlinkably</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <div>Transaction: {transactionHash.slice(0, 12)}...</div>
                  <div>Block: #{blockNumber}</div>
                  <div>Gas Used: 21,234</div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full font-mono">
                    VIEW TRANSACTION
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full font-mono">
                    SEND ANOTHER
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