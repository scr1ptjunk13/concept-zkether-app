import { useQuery } from "@tanstack/react-query";
import BalanceCard from "@/components/balance-card";
import PrivacyMeter from "@/components/privacy-meter";
import DepositFlow from "@/components/deposit-flow";
import WithdrawFlow from "@/components/withdraw-flow";
import ActivityFeed from "@/components/activity-feed";
import DotMatrix from "@/components/dot-matrix";
import { useState } from "react";

export default function Home() {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: balance } = useQuery({
    queryKey: ["/api/balance"],
  });

  const { data: privacyMetrics } = useQuery({
    queryKey: ["/api/privacy-metrics"],
    refetchInterval: 30000, // Update every 30 seconds
  });

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

      {/* Main App Container */}
      <div className="max-w-md mx-auto min-h-screen bg-background">
        {/* Header with App Title */}
        <header className="px-6 py-6 text-center">
          <div className="flex items-center justify-center space-x-2 breathing-dots">
            <DotMatrix pattern="header" />
            <h1 className="text-2xl font-mono font-bold tracking-wider">zkETHer</h1>
            <DotMatrix pattern="header" />
          </div>
        </header>

        {/* Balance Card */}
        <div className="px-6 mb-6">
          <BalanceCard balance={balance?.balance || 0} />
        </div>

        {/* Privacy Status */}
        <div className="px-6 mb-6">
          <PrivacyMeter 
            anonymitySetSize={privacyMetrics?.anonymitySetSize || 0}
            unlinkabilityScore={privacyMetrics?.unlinkabilityScore || 0}
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="bg-card border border-border rounded-lg p-4 text-center hover:bg-secondary transition-colors duration-200 fade-in"
              onClick={() => setShowDeposit(true)}
              data-testid="button-deposit"
            >
              <div className="w-3 h-3 bg-white rounded-full mx-auto mb-2 pulse-dot"></div>
              <div className="font-mono font-medium">DEPOSIT</div>
              <div className="text-xs text-muted-foreground">(Public)</div>
            </button>
            
            <button 
              className="bg-card border border-border rounded-lg p-4 text-center hover:bg-secondary transition-colors duration-200 fade-in"
              onClick={() => setShowWithdraw(true)}
              data-testid="button-withdraw"
            >
              <div className="w-3 h-3 bg-white rounded-full mx-auto mb-2 pulse-dot"></div>
              <div className="font-mono font-medium">WITHDRAW</div>
              <div className="text-xs text-muted-foreground">(Anonymous)</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-6 mb-6">
          <ActivityFeed />
        </div>
      </div>

      {/* Modals */}
      {showDeposit && (
        <DepositFlow 
          onClose={() => setShowDeposit(false)} 
        />
      )}
      
      {showWithdraw && (
        <WithdrawFlow 
          onClose={() => setShowWithdraw(false)} 
        />
      )}
    </div>
  );
}
