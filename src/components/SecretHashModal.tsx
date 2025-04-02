
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface SecretHashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => void;
}

const SecretHashModal: React.FC<SecretHashModalProps> = ({
  open,
  onOpenChange,
  onVerify,
}) => {
  const [secretHash, setSecretHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (!secretHash.trim()) {
      toast.error("Please enter your Secret Hash");
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      // For demo purposes, any non-empty hash is considered valid
      // In a real implementation, you would validate against a stored hash
      if (secretHash.trim()) {
        toast.success("Secret Hash verified successfully");
        setSecretHash("");
        onVerify();
        onOpenChange(false);
      } else {
        toast.error("Invalid Secret Hash. Please try again.");
      }
      setIsVerifying(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Verify Your Identity
          </DialogTitle>
          <DialogDescription>
            Please enter your Secret Hash to confirm your identity before voting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Enter your Secret Hash"
            value={secretHash}
            onChange={(e) => setSecretHash(e.target.value)}
            className="font-mono"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Your Secret Hash was provided to you during voter registration.
            This helps ensure the integrity of the voting process.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSecretHash("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify & Vote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SecretHashModal;
