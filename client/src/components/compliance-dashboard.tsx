import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Download, CheckCircle, FileText, Building } from "lucide-react";
import DotMatrix from "./dot-matrix";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useToast } from "@/hooks/use-toast";

interface ComplianceDashboardProps {
  onClose: () => void;
}

export default function ComplianceDashboard({ onClose }: ComplianceDashboardProps) {
  const { kycData, isKYCCompleted } = useOnboarding();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // Mock compliance data
  const complianceData = {
    totalTDSPaid: 0.05,
    transactionsReported: 12,
    complianceScore: 100,
    lastAudit: "Nov 2024",
    kycValidUntil: "Dec 2024",
    regulatoryFramework: ["EU MiCA", "India IT Act", "ERC-3643"]
  };

  const handleExportCertificate = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Tax Certificate Generated",
      description: "Compliance report downloaded successfully.",
    });
    
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent" />
                <CardTitle className="font-mono">Regulatory Compliance</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ERC-3643 Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <Building className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Token Compliance</h3>
                    <p className="text-xs text-muted-foreground">ERC-3643 Permissioned</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-accent font-mono">✓ Institutional Grade</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Permission Level:</span>
                    <span className="font-mono">Verified Investor</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Status */}
            {isKYCCompleted && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">KYC Status</h3>
                      <p className="text-xs text-muted-foreground">Identity Verification</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-accent font-mono">✓ Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span className="font-mono">{complianceData.kycValidUntil}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-mono text-xs">{kycData?.fullName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tax Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Tax Summary</h3>
                    <p className="text-xs text-muted-foreground">TDS & Reporting</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total TDS Paid:</span>
                    <span className="font-mono">{complianceData.totalTDSPaid.toFixed(3)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transactions Reported:</span>
                    <span className="font-mono">{complianceData.transactionsReported}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reporting Entity:</span>
                    <span className="font-mono text-xs">FIU-India</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Framework */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3">Regulatory Framework</h3>
                <div className="space-y-2">
                  {complianceData.regulatoryFramework.map((framework, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-accent" />
                      <span className="text-xs font-mono">{framework} Compliant</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compliance Score */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-accent mb-2">
                    {complianceData.complianceScore}%
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">Compliance Score</div>
                  <div className="flex justify-center mb-3">
                    <DotMatrix pattern="privacy" size="sm" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last Audit: {complianceData.lastAudit}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-3">Recent AML Reports</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nov 2024 - Deposit Report</span>
                    <span className="text-accent">✓ Filed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oct 2024 - Withdrawal Report</span>
                    <span className="text-accent">✓ Filed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sep 2024 - Monthly Summary</span>
                    <span className="text-accent">✓ Filed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleExportCertificate}
                className="w-full font-mono"
                disabled={isExporting}
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? "Generating..." : "Download Tax Certificate"}</span>
                  <DotMatrix pattern="header" size="sm" />
                </div>
              </Button>
              
              <Button variant="secondary" className="w-full font-mono text-sm">
                Export Compliance Report
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                All transactions are automatically reported to relevant regulatory authorities. 
                This mixer operates under institutional compliance frameworks.
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
