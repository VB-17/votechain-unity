
import React, { createContext, useState, useContext, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define profile type based on the database table
type Profile = {
  id: string;
  wallet_address: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  college_email: string | null;
  college_verified: boolean;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  requestAdminAccess: (faceId?: string) => Promise<void>;
  verifyCollegeEmail: (email: string) => Promise<void>;
}

const defaultContext: AuthContextType = {
  session: null,
  user: null,
  profile: null,
  loading: true,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  requestAdminAccess: async () => {},
  verifyCollegeEmail: async () => {},
};

const SupabaseAuthContext = createContext<AuthContextType>(defaultContext);

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

// This is the hardcoded super admin address from the requirements
const SUPER_ADMIN_ADDRESS = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data when user is set
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setProfile(data as Profile);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
      }
    };

    fetchProfile();
  }, [user]);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Connect wallet by generating a random wallet address for Phase 1
  const connectWallet = async (): Promise<void> => {
    try {
      // In Phase 1, we're simulating wallet connection similar to the existing implementation
      // Generate a random wallet address for demo purposes
      const randomNum = Math.floor(Math.random() * 1000);
      // For demo purposes, occasionally connect as the super admin
      const address = Math.random() < 0.05 ? SUPER_ADMIN_ADDRESS : `0x${randomNum}${Date.now().toString(16)}`;
      
      // Sign up the user with a random email based on the wallet address
      const walletEmail = `wallet_${address.toLowerCase()}@example.com`;
      const password = `password_${Date.now()}`;

      const { data, error } = await supabase.auth.signUp({
        email: walletEmail,
        password: password,
      });

      if (error) {
        // If user already exists, try to sign in
        if (error.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: walletEmail,
            password: password,
          });

          if (signInError) {
            throw signInError;
          }
        } else {
          throw error;
        }
      }

      // Create or update profile with wallet address
      const isSuperAdmin = address === SUPER_ADMIN_ADDRESS;
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            wallet_address: address,
            is_admin: isSuperAdmin,
            is_super_admin: isSuperAdmin,
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      toast.success("Wallet connected successfully");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };

  // Disconnect wallet by signing out
  const disconnectWallet = (): void => {
    supabase.auth.signOut().then(() => {
      toast.success("Wallet disconnected");
    }).catch(error => {
      console.error("Error signing out:", error);
      toast.error("Error disconnecting wallet");
    });
  };

  // Request admin access
  const requestAdminAccess = async (faceId?: string): Promise<void> => {
    if (!user || !profile) {
      toast.error("You must be signed in to request admin access");
      return;
    }

    try {
      const { error } = await supabase
        .from('admin_requests')
        .insert({
          user_id: user.id,
          wallet_address: profile.wallet_address,
          face_id: faceId,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast.success("Admin access requested. Awaiting approval.");
    } catch (error: any) {
      console.error("Failed to request admin access:", error);
      toast.error(`Failed to request admin access: ${error.message}`);
    }
  };

  // Verify college email
  const verifyCollegeEmail = async (email: string): Promise<void> => {
    if (!user) {
      toast.error("You must be signed in to verify email");
      return;
    }

    // Check if it's a valid college email (simple check for .edu domain)
    const isCollegeEmail = email.toLowerCase().endsWith('.edu');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          college_email: email,
          college_verified: isCollegeEmail,
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      if (isCollegeEmail) {
        toast.success("College email verified successfully");
        // Refresh profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setProfile(data as Profile);
        }
      } else {
        toast.warning("Email added but not recognized as a college email (.edu domain required)");
      }
    } catch (error: any) {
      console.error("Failed to verify college email:", error);
      toast.error(`Failed to verify email: ${error.message}`);
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        connectWallet,
        disconnectWallet,
        requestAdminAccess,
        verifyCollegeEmail,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};
