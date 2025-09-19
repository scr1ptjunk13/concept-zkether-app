import DotMatrix from "./dot-matrix";
import { useOnboarding } from "@/contexts/onboarding-context";

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const { isKYCCompleted } = useOnboarding();

  return (
    <div className="bg-card border border-border rounded-lg p-6 glow-effect fade-in">
      <div className="text-center mb-4">
        <div className="mb-4">
          <DotMatrix pattern="balance" />
        </div>
        <div className="text-3xl font-mono font-bold mb-2" data-testid="text-balance">
          {balance.toFixed(2)} ETH
        </div>
        <div className="text-sm text-muted-foreground font-mono">
          {isKYCCompleted ? "COMPLIANT & UNLINKABLE" : "UNLINKABLE"}
        </div>
      </div>
    </div>
  );
}
