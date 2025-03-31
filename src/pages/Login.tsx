
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
import { Wallet, Shield, UserCheck, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";

const voterFormSchema = z.object({
  email: z.string().email("Please enter a valid email address").refine(
    (email) => email.toLowerCase().endsWith('.edu'),
    {
      message: "Please use a college email ending with .edu",
    }
  ),
  name: z.string().min(3, "Name must be at least 3 characters"),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 18 && num <= 120;
  }, {
    message: "Age must be between 18 and 120",
  }),
  aadharNumber: z.string().length(12, "Aadhar number must be 12 digits"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type VoterFormValues = z.infer<typeof voterFormSchema>;

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

const Login: React.FC = () => {
  const { user, profile, loading, connectWallet, verifyCollegeEmail } = useSupabaseAuth();
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const [voterRegisterOpen, setVoterRegisterOpen] = useState(false);
  const [otpVerificationOpen, setOtpVerificationOpen] = useState(false);
  const [registrationSuccessOpen, setRegistrationSuccessOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<VoterFormValues | null>(null);
  
  const voterForm = useForm<VoterFormValues>({
    resolver: zodResolver(voterFormSchema),
    defaultValues: {
      email: "",
      name: "",
      age: "",
      aadharNumber: "",
      agreeToTerms: false,
    },
  });

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

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

  const handleSubmitVoterRegistration = async (values: VoterFormValues) => {
    try {
      // Store registration data for later use
      setRegistrationData(values);
      
      // Close the registration form and open OTP verification
      setVoterRegisterOpen(false);
      setOtpVerificationOpen(true);
      
      // Simulate sending OTP (in real app, this would call an API)
      toast.success("OTP has been sent to your email");
    } catch (error: any) {
      toast.error(`Failed to begin registration: ${error.message}`);
    }
  };

  const handleVerifyOtp = async (values: OtpFormValues) => {
    try {
      // In a real app, verify the OTP with backend
      // For demo, we'll simulate success with any 6-digit OTP
      
      if (registrationData?.email) {
        // Verify college email with Supabase
        await verifyCollegeEmail(registrationData.email);
        
        // Close OTP dialog and show success message
        setOtpVerificationOpen(false);
        setRegistrationSuccessOpen(true);
      }
    } catch (error: any) {
      toast.error(`Failed to verify OTP: ${error.message}`);
    }
  };

  const handleCompleteRegistration = () => {
    setRegistrationSuccessOpen(false);
    navigate("/dashboard");
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Register as a Voter</DialogTitle>
            <DialogDescription>
              Please provide your information to verify your eligibility to vote.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...voterForm}>
            <form onSubmit={voterForm.handleSubmit(handleSubmitVoterRegistration)} className="space-y-4">
              <FormField
                control={voterForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={voterForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="youremail@college.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={voterForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter your age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={voterForm.control}
                name="aadharNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar Number</FormLabel>
                    <FormControl>
                      <Input placeholder="12-digit Aadhar number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={voterForm.control}
                name="agreeToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I agree to the terms and conditions and verify that I am eligible to vote
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setVoterRegisterOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Continue
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={otpVerificationOpen} onOpenChange={setOtpVerificationOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              We've sent a 6-digit code to your email. Please enter it below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center space-y-2">
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Didn't receive the code?{" "}
                  <Button 
                    type="button" 
                    variant="link" 
                    className="p-0 h-auto text-primary"
                    onClick={() => toast.success("A new OTP has been sent to your email")}
                  >
                    Resend
                  </Button>
                </p>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOtpVerificationOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Verify
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Registration Success Dialog */}
      <Dialog open={registrationSuccessOpen} onOpenChange={setRegistrationSuccessOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Registration Successful</DialogTitle>
            <DialogDescription>
              Your voter registration was successful. 
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Important Information Sent
              </h4>
              <p className="text-sm text-green-700">
                We've sent an email to your registered address with important information. 
                Please store this information securely for future voting sessions.
              </p>
            </div>
            
            {registrationData && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Registration Details:</p>
                <div className="bg-muted p-3 rounded text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {registrationData.name}</p>
                  <p><span className="font-medium">Email:</span> {registrationData.email}</p>
                  <p><span className="font-medium">Wallet Address:</span> {profile?.wallet_address ? 
                    `${profile.wallet_address.substring(0, 6)}...${profile.wallet_address.substring(profile.wallet_address.length - 4)}` : 
                    'Not available'}</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleCompleteRegistration} className="w-full">
              Continue to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
