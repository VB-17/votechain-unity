
import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X, Shield, User } from "lucide-react";

type AdminRequest = {
  id: string;
  user_id: string;
  wallet_address: string;
  face_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    wallet_address: string | null;
  };
};

const AdminRequestsDashboard: React.FC = () => {
  const { profile } = useSupabaseAuth();
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});

  const fetchAdminRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_requests')
        .select(`
          *,
          profile:profiles(id, wallet_address)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data as AdminRequest[]);
    } catch (error: any) {
      console.error("Error fetching admin requests:", error);
      toast.error(`Failed to load admin requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_super_admin) {
      fetchAdminRequests();
    }
  }, [profile]);

  const handleApproveRequest = async (requestId: string, userId: string) => {
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    try {
      // Start a transaction to update both the admin request and the user's profile
      const { error: updateRequestError } = await supabase
        .from('admin_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateRequestError) {
        throw updateRequestError;
      }

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);

      if (updateProfileError) {
        throw updateProfileError;
      }

      toast.success("Admin request approved successfully");
      fetchAdminRequests();
    } catch (error: any) {
      console.error("Error approving admin request:", error);
      toast.error(`Failed to approve request: ${error.message}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingIds(prev => ({ ...prev, [requestId]: true }));
    try {
      const { error } = await supabase
        .from('admin_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      toast.success("Admin request rejected");
      fetchAdminRequests();
    } catch (error: any) {
      console.error("Error rejecting admin request:", error);
      toast.error(`Failed to reject request: ${error.message}`);
    } finally {
      setProcessingIds(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (!profile?.is_super_admin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          Admin Requests
        </CardTitle>
        <CardDescription>
          Approve or reject requests for admin access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-muted/20">
            <User className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No pending admin requests</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono">
                      {request.wallet_address.substring(0, 6)}...{request.wallet_address.substring(request.wallet_address.length - 4)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300 dark:hover:text-green-200"
                            onClick={() => handleApproveRequest(request.id, request.user_id)}
                            disabled={processingIds[request.id]}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800 dark:bg-red-950 dark:hover:bg-red-900 dark:border-red-800 dark:text-red-300 dark:hover:text-red-200"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingIds[request.id]}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRequestsDashboard;
