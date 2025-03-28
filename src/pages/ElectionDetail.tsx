
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Poll, PollOption } from "@/components/PollCard";
import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User, 
  Users
} from "lucide-react";
import { Candidate } from "@/types/profile";

const ElectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

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

  // Check if user has already voted
  useEffect(() => {
    const checkVote = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("poll_id", id)
        .eq("voter", user.id)
        .single();
      
      if (data) {
        setHasVoted(true);
        setSelectedCandidate(data.candidate_id);
      }
    };

    checkVote();
  }, [id, user]);

  const handleVote = async () => {
    if (!user) {
      toast.error("Please connect your wallet to vote");
      return;
    }

    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if this election has ended
      const now = new Date();
      const endTime = new Date(election?.end_time);
      
      if (now > endTime) {
        toast.error("This election has ended");
        setIsSubmitting(false);
        return;
      }

      // Insert vote record
      const { error: voteError } = await supabase
        .from("votes")
        .insert({
          poll_id: id,
          candidate_id: selectedCandidate,
          voter: user.id,
          vote: selectedCandidate
        });
      
      if (voteError) throw voteError;
      
      // Update candidate vote count
      const { error: updateError } = await supabase.rpc('increment_candidate_votes', { 
        candidate_id: selectedCandidate 
      });
      
      if (updateError) throw updateError;
      
      toast.success("Your vote has been recorded");
      setHasVoted(true);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to record your vote. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-7 w-48 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <div className="h-7 w-32 bg-muted animate-pulse rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-6 w-full bg-muted animate-pulse rounded"></div>
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform to Poll format for common components
  const electionPoll: Poll = {
    id: election?.id || "",
    title: election?.question || "",
    description: "",
    creator: election?.creator || "",
    options: election?.options as unknown as PollOption[] || [],
    totalVotes: candidates?.reduce((sum, c) => sum + (c.votes_count || 0), 0) || 0,
    createdAt: new Date(election?.created_at || ""),
    endsAt: new Date(election?.end_time || ""),
    isElection: true
  };

  const isAdmin = profile?.is_admin || profile?.is_super_admin;
  const isCreator = profile?.wallet_address === election?.creator;
  const canManage = isAdmin || isCreator;
  const hasEnded = new Date() > new Date(election?.end_time || "");

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
              <h1 className="text-3xl font-bold">{election?.question}</h1>
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
          
          {canManage && (
            <Button variant="outline" onClick={() => navigate(`/admin/elections/${id}`)}>
              Manage Election
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="candidates">
              <TabsList className="mb-4">
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="information">Information</TabsTrigger>
              </TabsList>
              
              <TabsContent value="candidates">
                <div className="grid grid-cols-1 gap-4">
                  {candidates && candidates.length > 0 ? (
                    candidates.map((candidate) => (
                      <CandidateCard 
                        key={candidate.id}
                        candidate={{
                          id: candidate.id,
                          name: candidate.name,
                          bio: candidate.bio,
                          position: candidate.position,
                          photoUrl: candidate.photo_url,
                          verified: candidate.verified || false,
                          votesCount: candidate.votes_count
                        }}
                        pollId={id || ""}
                        isSelected={selectedCandidate === candidate.id}
                        onVote={() => !hasVoted && setSelectedCandidate(candidate.id)}
                        userVoted={hasVoted ? selectedCandidate : undefined}
                        isElectionEnded={hasEnded}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">No candidates found</p>
                        <p className="text-sm text-muted-foreground text-center">
                          There are no candidates registered for this election yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {!hasVoted && !hasEnded && (
                  <Button 
                    className="w-full mt-6" 
                    disabled={!selectedCandidate || isSubmitting || !user}
                    onClick={handleVote}
                  >
                    {isSubmitting ? "Recording Vote..." : "Vote for Selected Candidate"}
                  </Button>
                )}
                
                {(hasVoted || hasEnded) && (
                  <Card className="mt-6 bg-muted/50">
                    <CardContent className="flex items-center justify-center py-4">
                      {hasVoted && (
                        <div className="flex items-center text-primary">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          <span className="font-medium">You have already voted in this election</span>
                        </div>
                      )}
                      {!hasVoted && hasEnded && (
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-5 w-5 mr-2" />
                          <span className="font-medium">This election has ended</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="information">
                <Card>
                  <CardHeader>
                    <CardTitle>Election Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-1">Description</h3>
                      <p className="text-muted-foreground">
                        {election?.question || "No description provided."}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Created By</h3>
                      <p className="text-muted-foreground">
                        {formatAddress(election?.creator || "")}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Election Period</h3>
                      <div className="flex flex-col space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Start:</span> {new Date(election?.created_at || "").toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">End:</span> {new Date(election?.end_time || "").toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Statistics</h3>
                      <div className="flex flex-col space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Total Candidates:</span> {candidates?.length || 0}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Total Votes:</span> {electionPoll.totalVotes}
                        </p>
                      </div>
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
                    <span className="font-medium">{electionPoll.totalVotes}</span>
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
                  <CardTitle>Leading Candidates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {candidates
                      .sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
                      .slice(0, 3)
                      .map((candidate, index) => (
                        <div key={candidate.id} className="flex justify-between items-center pb-2 border-b last:border-0">
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-xs font-medium">
                              {index + 1}
                            </span>
                            <span>{candidate.name}</span>
                          </div>
                          <span className="font-medium">{candidate.votes_count || 0} votes</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
