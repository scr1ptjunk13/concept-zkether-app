import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, CheckCircle, AlertCircle } from "lucide-react";
import DotMatrix from "../dot-matrix";
import { useOnboarding } from "@/contexts/onboarding-context";

interface KYCVerificationScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

type KYCStep = "form" | "verifying" | "success";

interface KYCFormData {
  fullName: string;
  aadhaarNumber: string;
  panNumber: string;
  phoneNumber: string;
}

export default function KYCVerificationScreen({ onBack, onComplete }: KYCVerificationScreenProps) {
  const [step, setStep] = useState<KYCStep>("form");
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState<KYCFormData>({
    fullName: "",
    aadhaarNumber: "",
    panNumber: "",
    phoneNumber: ""
  });
  const [errors, setErrors] = useState<Partial<KYCFormData>>({});
  const { completeKYC } = useOnboarding();

  const validateForm = (): boolean => {
    const newErrors: Partial<KYCFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.aadhaarNumber || formData.aadhaarNumber.replace(/\s/g, "").length !== 12) {
      newErrors.aadhaarNumber = "Valid 12-digit Aadhaar number required";
    }

    if (!formData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber.toUpperCase())) {
      newErrors.panNumber = "Valid PAN number required (e.g., ABCDE1234F)";
    }

    if (!formData.phoneNumber || !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Valid 10-digit Indian mobile number required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof KYCFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatAadhaar = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const limited = cleaned.slice(0, 12);
    return limited.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const maskAadhaar = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    if (cleaned.length <= 8) return formatAadhaar(value);
    const masked = "XXXX XXXX " + cleaned.slice(8);
    return masked;
  };

  const handleVerifyKYC = () => {
    if (!validateForm()) return;

    setStep("verifying");
    setProgress(0);

    // Simulate KYC verification process
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStep("success");
          completeKYC(formData);
          
          // Auto proceed after showing success
          setTimeout(() => {
            onComplete();
          }, 2000);
          
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const getVerificationStep = () => {
    if (progress < 25) return "Connecting to DigiLocker...";
    if (progress < 50) return "Verifying Aadhaar details...";
    if (progress < 75) return "Validating PAN information...";
    return "Finalizing KYC verification...";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Status Bar */}
      <div className="status-bar flex justify-between items-center px-4 py-2 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span>11:46</span>
          <div className="w-4 h-2 border border-white/30 rounded-sm">
            <div className="w-3/4 h-full bg-white rounded-sm"></div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs">5G</span>
          <div className="flex space-x-px">
            <div className="w-1 h-2 bg-white"></div>
            <div className="w-1 h-3 bg-white"></div>
            <div className="w-1 h-4 bg-white"></div>
            <div className="w-1 h-3 bg-white/50"></div>
          </div>
          <div className="w-4 h-2 border border-white/30 rounded-sm">
            <div className="w-2/3 h-full bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-6 py-6">
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-accent" />
                <h1 className="text-xl font-mono font-bold">KYC Verification</h1>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <div className="w-3 h-3 border-2 border-muted-foreground rounded-full"></div>
              </div>
            </div>

            {/* Info Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Complete KYC Verification</h3>
                    <p className="text-xs text-muted-foreground">Required for regulatory compliance in India</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name as per Aadhaar"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`mt-1 ${errors.fullName ? 'border-destructive' : ''}`}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aadhaar" className="text-sm font-medium">
                  Aadhaar Number *
                </Label>
                <Input
                  id="aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  value={maskAadhaar(formData.aadhaarNumber)}
                  onChange={(e) => handleInputChange("aadhaarNumber", e.target.value.replace(/\s/g, ""))}
                  className={`mt-1 font-mono ${errors.aadhaarNumber ? 'border-destructive' : ''}`}
                  maxLength={14}
                />
                {errors.aadhaarNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.aadhaarNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="pan" className="text-sm font-medium">
                  PAN Number *
                </Label>
                <Input
                  id="pan"
                  placeholder="ABCDE1234F"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                  className={`mt-1 font-mono ${errors.panNumber ? 'border-destructive' : ''}`}
                  maxLength={10}
                />
                {errors.panNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.panNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, ""))}
                  className={`mt-1 font-mono ${errors.phoneNumber ? 'border-destructive' : ''}`}
                  maxLength={10}
                />
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* Verification Button */}
            <div className="mt-8">
              <Button 
                onClick={handleVerifyKYC}
                className="w-full font-mono"
                size="lg"
              >
                <div className="flex items-center space-x-2">
                  <DotMatrix pattern="header" size="sm" />
                  <span>VERIFY WITH DIGILOCKER</span>
                  <DotMatrix pattern="header" size="sm" />
                </div>
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Your information is securely verified through government databases and encrypted for privacy protection.
              </p>
            </div>
          </motion.div>
        )}

        {step === "verifying" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent animate-pulse" />
              </div>
              <h2 className="text-xl font-mono font-bold mb-2">Verifying KYC</h2>
              <p className="text-sm text-muted-foreground">
                Progress: <span className="text-accent font-mono">{Math.round(progress)}%</span>
              </p>
            </div>

            {/* Progress Animation */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <DotMatrix pattern="privacy" size="sm" />
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{getVerificationStep()}</p>
                </div>
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Connecting to government database</p>
              <p>✓ Validating document authenticity</p>
              <p>• Verifying personal details...</p>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>

            <h2 className="text-xl font-mono font-bold text-accent mb-2">KYC Verified</h2>
            <p className="text-sm text-muted-foreground mb-6">Compliant User Status Confirmed</p>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-accent font-mono">✓ VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance:</span>
                    <span className="text-accent font-mono">✓ INDIA KYC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-mono">{formData.fullName}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <DotMatrix pattern="privacy" size="sm" />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Proceeding to privacy key generation...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
