import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useToast } from "@/hooks/use-toast";
import DotMatrix from "./dot-matrix";
import { motion } from "framer-motion";
import { ArrowLeft, Settings, Shield, Download, HelpCircle, User, FileText, Lock } from "lucide-react";

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { isKYCCompleted, kycData } = useOnboarding();
  const { toast } = useToast();
  const [autoDeductTDS, setAutoDeductTDS] = useState(true);
  const [shareDataWithAuthorities, setShareDataWithAuthorities] = useState(true);

  const handleUpdateKYC = () => {
    toast({
      title: "KYC Update",
      description: "KYC update process initiated. You will be redirected to verification portal.",
    });
  };

  const handleDownloadReport = (reportType: string) => {
    toast({
      title: "Download Started",
      description: `${reportType} report is being generated and will be downloaded shortly.`,
    });
  };

  const handleRegulatoryHelp = () => {
    toast({
      title: "Regulatory Helpdesk",
      description: "Connecting you to our compliance support team...",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" data-testid="modal-settings">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="font-mono">Settings</CardTitle>
            </div>
            <Settings className="w-5 h-5" />
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex space-x-1 justify-center mb-4">
              <DotMatrix pattern="header" size="sm" />
            </div>

            {/* KYC Status Section */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>KYC Status</span>
                </h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verification Status:</span>
                    <div className="flex items-center space-x-2">
                      {isKYCCompleted ? (
                        <>
                          <span className="text-accent text-sm">Verified</span>
                          <span className="text-accent">✓</span>
                        </>
                      ) : (
                        <span className="text-destructive text-sm">Not Verified</span>
                      )}
                    </div>
                  </div>
                  
                  {isKYCCompleted && kycData && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-mono">{kycData.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Valid Until:</span>
                        <span className="font-mono">Dec 2024</span>
                      </div>
                    </>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full font-mono"
                  onClick={handleUpdateKYC}
                  data-testid="button-update-kyc"
                >
                  {isKYCCompleted ? "Update KYC" : "Complete KYC"}
                </Button>
              </CardContent>
            </Card>

            {/* Tax Preferences Section */}
            {isKYCCompleted && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Tax Preferences</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm">Auto-deduct TDS</span>
                        <p className="text-xs text-muted-foreground">Automatically deduct 1% TDS on transactions</p>
                      </div>
                      <Switch 
                        checked={autoDeductTDS}
                        onCheckedChange={setAutoDeductTDS}
                        disabled={true}
                        data-testid="switch-auto-tds"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <Lock className="w-3 h-3 inline mr-1" />
                      TDS auto-deduction is mandatory for compliance
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reporting Section */}
            {isKYCCompleted && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Reporting</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm">Share data with tax authorities</span>
                        <p className="text-xs text-muted-foreground">Required for regulatory compliance</p>
                      </div>
                      <Switch 
                        checked={shareDataWithAuthorities}
                        onCheckedChange={setShareDataWithAuthorities}
                        disabled={true}
                        data-testid="switch-share-data"
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Data sharing with FIU-India is mandatory
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Privacy Level Section */}
            {isKYCCompleted && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Privacy Level</span>
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Mode:</span>
                      <span className="text-accent text-sm font-mono">Compliant Privacy Mode</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      <Lock className="w-3 h-3 inline mr-1" />
                      Privacy mode locked for regulatory compliance
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      • Zero-knowledge proofs maintain transaction privacy
                      • Regulatory reporting ensures compliance
                      • Identity verification prevents misuse
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export Options Section */}
            {isKYCCompleted && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-medium text-sm flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Options</span>
                  </h4>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-mono text-xs"
                      onClick={() => handleDownloadReport("Tax Certificate")}
                      data-testid="button-download-tax"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download Tax Certificate
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-mono text-xs"
                      onClick={() => handleDownloadReport("Compliance Report")}
                      data-testid="button-download-compliance"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download Compliance Report
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full font-mono text-xs"
                      onClick={() => handleDownloadReport("Transaction History")}
                      data-testid="button-download-history"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download Transaction History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Support Section */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-medium text-sm flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Support</span>
                </h4>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full font-mono"
                  onClick={handleRegulatoryHelp}
                  data-testid="button-regulatory-help"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Regulatory Helpdesk
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  Get help with compliance questions, KYC issues, or regulatory updates.
                </div>
              </CardContent>
            </Card>

            {/* App Info */}
            <div className="text-center space-y-2 pt-4 border-t">
              <div className="flex space-x-1 justify-center">
                <DotMatrix pattern="privacy" size="sm" />
              </div>
              <div className="text-xs text-muted-foreground">
                zkETHer v1.0.0 - Compliant Privacy Protocol
              </div>
              <div className="text-xs text-muted-foreground">
                Licensed under India IT Act & EU MiCA
              </div>
            </div>

            {/* Close Button */}
            <Button 
              onClick={onClose}
              className="w-full font-mono"
              data-testid="button-close-settings"
            >
              <div className="flex items-center space-x-2">
                <DotMatrix pattern="header" size="sm" />
                <span>CLOSE</span>
                <DotMatrix pattern="header" size="sm" />
              </div>
            </Button>
          </CardContent>
        </motion.div>
      </div>
    </div>
  );
}
