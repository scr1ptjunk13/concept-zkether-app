import DotMatrix from "./dot-matrix";

interface PrivacyMeterProps {
  anonymitySetSize: number;
  unlinkabilityScore: number;
}

export default function PrivacyMeter({ 
  anonymitySetSize, 
  unlinkabilityScore 
}: PrivacyMeterProps) {
  const getPrivacyLevel = () => {
    if (anonymitySetSize === 0) return "None";
    if (anonymitySetSize < 100) return "Low";
    if (anonymitySetSize < 1000) return "Medium";
    return "High";
  };

  const getPrivacyColor = () => {
    const level = getPrivacyLevel();
    switch (level) {
      case "None": return "text-destructive";
      case "Low": return "text-yellow-500";
      case "Medium": return "text-accent";
      case "High": return "text-accent";
      default: return "text-muted-foreground";
    }
  };

  const getLinkabilityPercentage = () => {
    return anonymitySetSize > 0 ? (100 / anonymitySetSize * 100).toFixed(3) : "100";
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 fade-in">
      <div className="text-sm text-muted-foreground mb-2">
        Anonymity Set: <span className={`font-mono ${getPrivacyColor()}`} data-testid="text-anonymity-set">
          {anonymitySetSize} users
        </span>
      </div>
      
      {/* Privacy Indicator Dots */}
      <div className="mb-3">
        <DotMatrix pattern="privacy" />
      </div>
      
      <div className="text-xs text-muted-foreground mb-2" data-testid="text-unlinkable-status">
        {anonymitySetSize > 0 ? "Your withdrawals are unlinkable" : "No privacy yet - be the first to deposit!"}
      </div>
      
      <div className="flex justify-between text-xs font-mono">
        <span data-testid="text-privacy-level">
          Privacy Level: <span className={getPrivacyColor()}>
            {getPrivacyLevel()} ({getLinkabilityPercentage()}%)
          </span>
        </span>
        <span data-testid="text-unlinkability-score">
          Unlinkability: <span className={getPrivacyColor()}>
            {unlinkabilityScore.toFixed(1)}%
          </span>
        </span>
      </div>
    </div>
  );
}
