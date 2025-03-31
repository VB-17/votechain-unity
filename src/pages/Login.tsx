
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";

const Login: React.FC = () => {
  const { user, profile, loading, connectWallet, verifyCollegeEmail } = useSupabaseAuth();
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const [voterRegisterOpen, setVoterRegisterOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Redirect if already logged in and completed register flow
  useEffect(() => {
    if (user && !loading && (profile?.college_verified || profile?.is_admin || profile?.is_super_admin)) {
      navigate("/dashboard");
    } else if (user && !loading) {
      // Wallet connected but not registered as voter or admin
      setWalletConnected(true);
    }
  }, [user, profile, loading, navigate]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet connected successfully");
      setWalletConnected(true);
    } catch (error: any) {
      toast.error(`Failed to connect wallet: ${error.message}`);
    }
  };

  const handleSubmitVoterRegistration = async () => {
    if (!email) {
      toast.error("Please enter your college email");
      return;
    }

    if (!agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    try {
      await verifyCollegeEmail(email);
      setVoterRegisterOpen(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(`Failed to register: ${error.message}`);
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
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {!walletConnected ? "Sign in to VoteChain" : "Welcome to VoteChain"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {!walletConnected
              ? "Connect your wallet to access the platform"
              : profile?.wallet_address
                ? `Wallet connected: ${profile.wallet_address.substring(0, 6)}...${profile.wallet_address.substring(profile.wallet_address.length - 4)}`
                : "Wallet connected"}
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {!walletConnected ? (
            <Button 
              onClick={handleConnectWallet} 
              className="w-full h-12 text-lg"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Connect Wallet
            </Button>
          ) : (
            <div className="space-y-4">
              {profile?.is_super_admin && (
                <Button 
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Go to Admin Dashboard
                </Button>
              )}
              
              {profile?.is_admin && !profile?.is_super_admin && (
                <Button 
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Go to Admin Dashboard
                </Button>
              )}
              
              {!profile?.college_verified && (
                <Button 
                  className="w-full"
                  onClick={() => setVoterRegisterOpen(true)}
                  variant={profile?.is_admin || profile?.is_super_admin ? "outline" : "default"}
                >
                  <UserCheck className="mr-2 h-5 w-5" />
                  Register as Voter
                </Button>
              )}
            </div>
          )}
          
          {!walletConnected && (
            <>
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
            </>
          )}
          
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

      {/* Voter Registration Dialog */}
      <Dialog open={voterRegisterOpen} onOpenChange={setVoterRegisterOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Register as a Voter</DialogTitle>
            <DialogDescription>
              Please enter your college email to verify your eligibility to vote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right col-span-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@college.edu"
                className="col-span-3"
              />
              <div className="col-span-4 text-sm text-muted-foreground">
                Your email must be a valid college email address ending with .edu
              </div>
            </div>
            
            <div className="flex items-center space-x-2 col-span-4">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground"
              >
                I agree to the terms and conditions and verify that I am eligible to vote
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVoterRegisterOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitVoterRegistration}>
              Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
