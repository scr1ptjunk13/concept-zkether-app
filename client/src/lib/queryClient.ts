import { QueryClient } from "@tanstack/react-query";

// Mock data for static frontend
export const mockData = {
  balance: { balance: 2.5 },
  privacyMetrics: {
    id: "1",
    anonymitySetSize: 47,
    unlinkabilityScore: 97.8,
    updatedAt: new Date(),
  },
  activity: [
    {
      id: "1",
      type: "deposit",
      status: "committed",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      id: "2", 
      type: "withdrawal",
      status: "completed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "3",
      type: "deposit", 
      status: "committed",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
  ],
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
