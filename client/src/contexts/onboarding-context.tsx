import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingContextType {
  isWalletConnected: boolean;
  isZkKeysGenerated: boolean;
  walletAddress: string | null;
  walletBalance: string | null;
  walletType: string | null;
  connectWallet: (type: string) => Promise<void>;
  generateZkKeys: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isZkKeysGenerated, setIsZkKeysGenerated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);

  // Check if user has completed onboarding
  useEffect(() => {
    const walletConnected = localStorage.getItem('zkether_wallet_connected');
    const zkKeys = localStorage.getItem('zkether_zk_keys_generated');
    const address = localStorage.getItem('zkether_wallet_address');
    const balance = localStorage.getItem('zkether_wallet_balance');
    const type = localStorage.getItem('zkether_wallet_type');
    
    if (walletConnected === 'true') {
      setIsWalletConnected(true);
      setWalletAddress(address);
      setWalletBalance(balance);
      setWalletType(type);
    }
    
    if (zkKeys === 'true') {
      setIsZkKeysGenerated(true);
    }
  }, []);

  const connectWallet = async (type: string) => {
    // Simulate wallet connection with mock data
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockAddress = `0x${Math.random().toString(16).slice(2, 42)}`;
    const mockBalance = (Math.random() * 10 + 1).toFixed(2);
    
    setWalletAddress(mockAddress);
    setWalletBalance(mockBalance);
    setWalletType(type);
    setIsWalletConnected(true);
    
    // Store in localStorage
    localStorage.setItem('zkether_wallet_connected', 'true');
    localStorage.setItem('zkether_wallet_address', mockAddress);
    localStorage.setItem('zkether_wallet_balance', mockBalance);
    localStorage.setItem('zkether_wallet_type', type);
  };

  const generateZkKeys = async () => {
    // Simulate key generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsZkKeysGenerated(true);
    localStorage.setItem('zkether_zk_keys_generated', 'true');
  };

  const completeOnboarding = () => {
    // Additional completion logic if needed
  };

  const resetOnboarding = () => {
    setIsWalletConnected(false);
    setIsZkKeysGenerated(false);
    setWalletAddress(null);
    setWalletBalance(null);
    setWalletType(null);
    
    localStorage.removeItem('zkether_wallet_connected');
    localStorage.removeItem('zkether_zk_keys_generated');
    localStorage.removeItem('zkether_wallet_address');
    localStorage.removeItem('zkether_wallet_balance');
    localStorage.removeItem('zkether_wallet_type');
  };

  return (
    <OnboardingContext.Provider value={{
      isWalletConnected,
      isZkKeysGenerated,
      walletAddress,
      walletBalance,
      walletType,
      connectWallet,
      generateZkKeys,
      completeOnboarding,
      resetOnboarding,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}