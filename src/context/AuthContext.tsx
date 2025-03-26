
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type AuthStatus = "disconnected" | "connecting" | "connected";

interface User {
  address: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const defaultContext: AuthContextType = {
  status: "disconnected",
  user: null,
  connect: async () => {},
  disconnect: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

// This is the hardcoded super admin address for Phase 1
const SUPER_ADMIN_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("disconnected");
  const [user, setUser] = useState<User | null>(null);

  // Check for saved wallet connection
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      const isSuperAdmin = savedAddress === SUPER_ADMIN_ADDRESS;
      setUser({
        address: savedAddress,
        isAdmin: isSuperAdmin || Math.random() > 0.7, // Some random wallets are admins for demo
        isSuperAdmin,
      });
      setStatus("connected");
    }
  }, []);

  const connect = async (): Promise<void> => {
    try {
      setStatus("connecting");
      
      // In Phase 1, we're simulating wallet connection
      // In a real app, this would use MetaMask or another wallet provider
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate connection delay
      
      // Generate a random wallet address for demo purposes
      const randomNum = Math.floor(Math.random() * 1000);
      // For demo purposes, occasionally connect as the super admin
      const address = Math.random() < 0.05 ? SUPER_ADMIN_ADDRESS : `0x${randomNum}${Date.now().toString(16)}`;
      
      const isSuperAdmin = address === SUPER_ADMIN_ADDRESS;
      
      setUser({
        address,
        isAdmin: isSuperAdmin || Math.random() > 0.7, // Some random wallets are admins for demo
        isSuperAdmin,
      });
      
      localStorage.setItem("walletAddress", address);
      setStatus("connected");
      
      toast.success("Wallet connected successfully");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setStatus("disconnected");
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const disconnect = (): void => {
    setUser(null);
    setStatus("disconnected");
    localStorage.removeItem("walletAddress");
    toast.success("Wallet disconnected");
  };

  return (
    <AuthContext.Provider value={{ status, user, connect, disconnect }}>
      {children}
    </AuthContext.Provider>
  );
};
