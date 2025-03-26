
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Shield, Camera, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
});

const AdminSignup: React.FC = () => {
  const { connectWallet, requestAdminAccess } = useSupabaseAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captureMode, setCaptureMode] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
    },
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCaptureMode(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please ensure camera permissions are granted.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get data URL from canvas
    const imageData = canvas.toDataURL("image/png");
    setFaceImage(imageData);
    
    // Stop camera
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    setCaptureMode(false);
    toast.success("Face image captured successfully");
  };

  const resetCapture = () => {
    setFaceImage(null);
    setCaptureMode(false);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!faceImage) {
      toast.error("Please capture your face image for verification");
      return;
    }

    try {
      setLoading(true);
      // Connect wallet first
      await connectWallet();
      
      // Then request admin access with face image
      await requestAdminAccess(faceImage);
      
      toast.success("Admin request submitted successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(`Failed to sign up: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-subtle border">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Admin Signup</h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect your wallet and complete face verification to request admin access
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="walletAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your wallet address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <FormLabel>Face Verification</FormLabel>
              
              {faceImage ? (
                <div className="relative">
                  <img 
                    src={faceImage} 
                    alt="Captured face" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={resetCapture}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : captureMode ? (
                <div className="space-y-2">
                  <div className="relative border rounded-md overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      type="button"
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                      onClick={captureImage}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resetCapture}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-48 border-dashed flex flex-col items-center justify-center"
                  onClick={startCamera}
                >
                  <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                  <span>Click to capture your face</span>
                </Button>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-lg"
              size="lg"
              disabled={loading || !faceImage}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-pulse-slow">Processing...</span>
                </span>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Request Admin Access
                </>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="text-center text-sm">
          <p className="mt-2 text-gray-600">
            Already have access?{" "}
            <a 
              href="/login" 
              className="font-medium text-primary hover:text-primary/80"
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
