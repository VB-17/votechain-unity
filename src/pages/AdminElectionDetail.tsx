
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Trash2, 
  User,
  UserPlus,
  XCircle
} from "lucide-react";

// Candidate form schema
const candidateFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  position: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  wallet_address: z.string().optional(),
  photo_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  verified: z.boolean().default(false)
});

interface Candidate {
  id: string;
  name: string;
  bio: string | null;
  position: string | null;
  photo_url: string | null;
  verified: boolean;
  votes_count: number;
  wallet_address: string | null;
}

const AdminElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, profile } = useSupabaseAuth();
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState<Candidate | null>(null);

  // Create form
  const form = useForm<z.infer<typeof candidateFormSchema>>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: "",
      position: "",
      bio: "",
      wallet_address: "",
      photo_url: "",
      verified: false
    }
  });

  // Reset form when modal opens/closes or when editing a different candidate
  useEffect(() => {
    if (isCandidateModalOpen && currentCandidate) {
      form.reset({
        name: currentCandidate.name,
        position: currentCandidate.position || "",
        bio: currentCandidate.bio || "",
        wallet_address: currentCandidate.wallet_address || "",
        photo_url: currentCandidate.photo_url || "",
        verified: currentCandidate.verified
      });
    } else if (isCandidateModalOpen) {
      form.reset({
        name: "",
        position: "",
        bio: "",
        wallet_address: "",
        photo_url: "",
        verified: false
      });
    }
  }, [isCandidateModalOpen, currentCandidate, form]);

  // Fetch election details
  const { data: election, isLoading: isLoadingElection } = useQuery({
    queryKey: ["election", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch candidates for this election
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("poll_id", id)
        .order("name");
      
      if (error) throw error;
      return data as Candidate[];
    },
  });

  // Fetch votes for this election
  const { data: votes } = useQuery({
    queryKey: ["votes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("*, profiles(wallet_address)")
        .eq("poll_id", id);
      
      if (error) throw error;
      return data;
    },
  });

  // Check if user has admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      
      if (!profile?.is_admin && !profile?.is_super_admin && profile?.wallet_address !== election?.creator) {
        toast.error("You don't have permission to access this page");
        navigate("/");
      }
    };

    if (!isLoadingElection) {
      checkAccess();
    }
  }, [user, profile, election, navigate, isLoadingElection]);

  const handleAddCandidate = async (values: z.infer<typeof candidateFormSchema>) => {
    try {
      if (currentCandidate) {
        // Update existing candidate
        const { error } = await supabase
          .from("candidates")
          .update({
            name: values.name,
            position: values.position || null,
            bio: values.bio || null,
            wallet_address: values.wallet_address || null,
            photo_url: values.photo_url || null,
            verified: values.verified
          })
          .eq("id", currentCandidate.id);
          
        if (error) throw error;
        toast.success("Candidate updated successfully");
      } else {
        // Add new candidate
        const { error } = await supabase
          .from("candidates")
          .insert({
            name: values.name,
            position: values.position || null,
            bio: values.bio || null,
            wallet_address: values.wallet_address || null,
            photo_url: values.photo_url || null,
            poll_id: id,
            verified: values.verified
          });
          
        if (error) throw error;
        toast.success("Candidate added successfully");
      }
      
      // Refresh candidates data
      queryClient.invalidateQueries({ queryKey: ["candidates", id] });
      setIsCandidateModalOpen(false);
      setCurrentCandidate(null);
    } catch (error) {
      console.error("Error adding/updating candidate:", error);
      toast.error("Failed to save candidate. Please try again.");
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm("Are you sure you want to delete this candidate? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Delete candidate
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);
        
      if (error) throw error;
      
      // Refresh candidates data
      queryClient.invalidateQueries({ queryKey: ["candidates", id] });
      toast.success("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEndElection = async () => {
    if (!confirm("Are you sure you want to end this election now? This action cannot be undone.")) {
      return;
    }
    
    try {
      // Update election end time to now
      const { error } = await supabase
        .from("polls")
        .update({
          end_time: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
      
      // Refresh election data
      queryClient.invalidateQueries({ queryKey: ["election", id] });
      toast.success("Election ended successfully");
    } catch (error) {
      console.error("Error ending election:", error);
      toast.error("Failed to end election. Please try again.");
    }
  };

  const handleVerifyCandidate = async (candidateId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ verified })
        .eq("id", candidateId);
        
      if (error) throw error;
      
      // Refresh candidates data
      queryClient.invalidateQueries({ queryKey: ["candidates", id] });
      toast.success(`Candidate ${verified ? "verified" : "unverified"} successfully`);
    } catch (error) {
      console.error("Error updating candidate verification:", error);
      toast.error("Failed to update candidate verification. Please try again.");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeRemaining = end.getTime() - now.getTime();
    
    if (timeRemaining <= 0) return "Ended";
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    
    return `${minutes}m remaining`;
  };

  if (isLoadingElection || isLoadingCandidates) {
    return (
      <div className="min-h-screen pt-24">
        <Navbar />
        <div className="layout-container">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="h-7 w-48 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const hasEnded = new Date() > new Date(election?.end_time || "");
  const totalVotes = candidates?.reduce((sum, c) => sum + (c.votes_count || 0), 0) || 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Navbar />
      <div className="layout-container">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin: {election?.question}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {new Date(election?.created_at || "").toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>By {formatAddress(election?.creator || "")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{getTimeRemaining(election?.end_time || "")}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/elections/${id}`)}
            >
              View Public Page
            </Button>
            
            {!hasEnded && (
              <Button 
                variant="destructive" 
                onClick={handleEndElection}
              >
                End Election Now
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <Tabs defaultValue="candidates">
              <TabsList className="mb-4">
                <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
                <TabsTrigger value="votes">Vote Records</TabsTrigger>
                <TabsTrigger value="settings">Election Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="candidates">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Candidates</CardTitle>
                      <CardDescription>Manage election candidates</CardDescription>
                    </div>
                    <Button onClick={() => {
                      setCurrentCandidate(null);
                      setIsCandidateModalOpen(true);
                    }}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Candidate
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {candidates && candidates.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Votes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates.map((candidate) => (
                            <TableRow key={candidate.id}>
                              <TableCell className="font-medium">{candidate.name}</TableCell>
                              <TableCell>{candidate.position || "N/A"}</TableCell>
                              <TableCell>
                                {candidate.verified ? (
                                  <span className="flex items-center text-green-500">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="flex items-center text-muted-foreground">
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Unverified
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{candidate.votes_count || 0}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleVerifyCandidate(candidate.id, !candidate.verified)}
                                  >
                                    {candidate.verified ? "Unverify" : "Verify"}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => {
                                      setCurrentCandidate(candidate);
                                      setIsCandidateModalOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-lg font-medium mb-2">No candidates yet</p>
                        <p className="text-sm text-muted-foreground text-center mb-4">
                          Add candidates to allow voters to make their selection
                        </p>
                        <Button 
                          onClick={() => {
                            setCurrentCandidate(null);
                            setIsCandidateModalOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add First Candidate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="votes">
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Records</CardTitle>
                    <CardDescription>View all votes cast in this election</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {votes && votes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Voter</TableHead>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {votes.map((vote) => {
                            const candidate = candidates?.find(c => c.id === vote.candidate_id);
                            return (
                              <TableRow key={vote.id}>
                                <TableCell>{formatAddress(vote.voter)}</TableCell>
                                <TableCell>{candidate?.name || "Unknown Candidate"}</TableCell>
                                <TableCell>{new Date(vote.created_at).toLocaleString()}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-lg font-medium mb-2">No votes recorded</p>
                        <p className="text-sm text-muted-foreground text-center">
                          There are no votes recorded for this election yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Election Settings</CardTitle>
                    <CardDescription>Configure election parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Election Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Basic information about the election
                        </p>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input value={election?.question} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Creator</label>
                            <Input value={election?.creator} readOnly />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Timeline</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Election start and end times
                        </p>
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <Input value={new Date(election?.created_at).toLocaleString()} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium">End Date</label>
                            <Input value={new Date(election?.end_time).toLocaleString()} readOnly />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Status</label>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className={`w-3 h-3 rounded-full ${hasEnded ? "bg-red-500" : "bg-green-500"}`}></div>
                              <span>{hasEnded ? "Ended" : "Active"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!hasEnded && (
                        <Button 
                          variant="destructive" 
                          onClick={handleEndElection}
                        >
                          End Election Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Election Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${hasEnded ? "text-destructive" : "text-green-500"}`}>
                      {hasEnded ? "Ended" : "Active"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Candidates</span>
                    <span className="font-medium">{candidates?.length || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Total Votes</span>
                    <span className="font-medium">{totalVotes}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Time Remaining</span>
                    <span className="font-medium">
                      {getTimeRemaining(election?.end_time || "")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {candidates && candidates.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Vote Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidates
                      .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
                      .map((candidate) => {
                        const percentage = totalVotes > 0 
                          ? Math.round(((candidate.votes_count || 0) / totalVotes) * 100) 
                          : 0;
                        
                        return (
                          <div key={candidate.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{candidate.name}</span>
                              <span className="font-medium">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {candidate.votes_count || 0} votes
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Candidate Modal */}
      <Dialog open={isCandidateModalOpen} onOpenChange={setIsCandidateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentCandidate ? "Edit Candidate" : "Add New Candidate"}</DialogTitle>
            <DialogDescription>
              {currentCandidate 
                ? "Update candidate information and verification status" 
                : "Add a new candidate to this election"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddCandidate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Candidate name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. President, Treasurer" {...field} />
                    </FormControl>
                    <FormDescription>
                      The position this candidate is running for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Candidate biography" 
                        rows={3}
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of the candidate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="wallet_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      Optional: The candidate's wallet address for verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      Optional: URL to the candidate's photo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="verified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Verified Status</FormLabel>
                      <FormDescription>
                        Mark this candidate as verified
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">
                  {currentCandidate ? "Update Candidate" : "Add Candidate"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminElectionDetail;
