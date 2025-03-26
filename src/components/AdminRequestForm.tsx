
import React, { useState } from "react";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ShieldCheck } from "lucide-react";

const AdminRequestForm: React.FC = () => {
  const { profile, requestAdminAccess } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  // In Phase 1, we'll simulate the facial recognition by just submitting the request
  // In Phase 2, we would integrate with FaceIO or similar
  const handleRequestAdmin = async () => {
    setIsSubmitting(true);
    try {
      // For Phase 1, we're skipping actual facial recognition
      // In Phase 2, we would capture a faceId here
      await requestAdminAccess();
      setIsRequested(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profile?.is_admin || profile?.is_super_admin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Admin Status
          </CardTitle>
          <CardDescription>
            You already have admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/10 p-4 rounded-md">
            <p className="text-sm">
              {profile.is_super_admin 
                ? "You have super admin privileges. You can approve admin requests and manage elections."
                : "You have admin privileges. You can create and manage elections."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isRequested) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Request Submitted</CardTitle>
          <CardDescription>
            Your request for admin access has been submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              The Super Admin will review your request soon. You'll be notified once it's approved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Admin Access</CardTitle>
        <CardDescription>
          Admins can create official elections and verify voters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          To request admin access:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm mb-4">
          <li>Submit your request with the button below</li>
          <li>In Phase 2, you'll complete a facial scan for verification</li>
          <li>The Super Admin will review your request</li>
          <li>Once approved, you'll gain admin privileges</li>
        </ol>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRequestAdmin} 
          disabled={isSubmitting}
          className="w-full"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting Request..." : "Request Admin Access"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminRequestForm;
