import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OnboardingProvider, useOnboarding } from "@/contexts/onboarding-context";
import OnboardingFlow from "@/components/onboarding/onboarding-flow";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isWalletConnected, isZkKeysGenerated } = useOnboarding();
  
  // Show onboarding if wallet not connected or zk keys not generated
  if (!isWalletConnected || !isZkKeysGenerated) {
    return <OnboardingFlow onComplete={() => {}} />;
  }
  
  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <AppContent />
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
