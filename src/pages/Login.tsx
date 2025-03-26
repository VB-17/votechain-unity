
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { Wallet, Shield } from "lucide-react";
import { toast } from "sonner";

const Login: React.FC = () => {
  const { user, loading, connectWallet } = useSupabaseAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-subtle border">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3">
            <span className="text-white font-bold text-lg">VC</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to VoteChain</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect your wallet to access the platform
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <Button 
            onClick={handleConnectWallet} 
            className="w-full h-12 text-lg"
            size="lg"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
          
          <div className="flex items-center justify-center">
            <span className="bg-muted h-px flex-1" />
            <span className="px-4 text-xs text-muted-foreground">OR</span>
            <span className="bg-muted h-px flex-1" />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link to="/admin-signup">
              <Shield className="mr-2 h-5 w-5" />
              Admin Signup
            </Link>
          </Button>
          
          <div className="text-center text-sm">
            <p className="mt-2 text-gray-600">
              By connecting your wallet, you agree to our{" "}
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
