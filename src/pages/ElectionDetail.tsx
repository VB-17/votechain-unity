
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import VoteChart from "@/components/VoteChart";
import { Candidate, PollOption } from "@/types/profile";

import { 
  Button,
  buttonVariants
} from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Calendar, 
  ChevronLeft, 
  User, 
  Users
} from "lucide-react";

const ElectionDetail = () => {
  const { id } = useParams();
  const { user, profile } = useSupabaseAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  
  // Fetch election details
  const { data: election, isLoading: electionLoading } = useQuery({
    queryKey: ["election", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  
  // Fetch candidates
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["candidates", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("poll_id", id)
        .order("votes_count", { ascending: false });
        
      if (error) throw error;
      return data as unknown as Candidate[];
    },
    enabled: !!id,
  });
  
  // Check if user has already voted
  useEffect(() => {
    const checkUserVote = async () => {
      if (!id || !user || !profile?.wallet_address) return;
      
      try {
        const { data, error } = await supabase
          .from("votes")
          .select("vote, candidate_id")
          .eq("poll_id", id)
          .eq("voter", profile.wallet_address)
          .single();
          
        if (error) {
          if (error.code !== "PGRST116") { // PGRST116 means no rows returned
            console.error("Error checking vote:", error);
          }
          return;
        }
        
        if (data) {
          setHasVoted(true);
          setUserVote(data.candidate_id || null);
          setSelectedCandidate(data.candidate_id || null);
        }
      } catch (error) {
        console.error("Error checking vote:", error);
      }
    };
    
    checkUserVote();
  }, [id, user, profile?.wallet_address]);
  
  const hasEnded = election ? new Date(election.end_time) < new Date() : false;
  
  const handleVote = async () => {
    if (!id || !user || !profile?.wallet_address || !selectedCandidate) {
      toast.error("Please select a candidate to vote");
      return;
    }
    
    if (hasVoted) {
      toast.error("You have already voted in this election");
      return;
    }
    
    if (hasEnded) {
      toast.error("This election has ended");
      return;
    }
    
    try {
      setIsVoting(true);
      
      // Record the vote
      const { error: voteError } = await supabase
        .from("votes")
        .insert({
          poll_id: id,
          voter: profile.wallet_address,
          vote: selectedCandidate,
          candidate_id: selectedCandidate
        });
        
      if (voteError) throw voteError;
      
      // Increment the candidate's vote count using the edge function
      const { error: incrementError } = await supabase.functions.invoke(
        "increment_candidate_votes",
        {
          body: { candidateId: selectedCandidate },
        }
      );
      
      if (incrementError) throw incrementError;
      
      toast.success("Vote recorded successfully!");
      setHasVoted(true);
      setUserVote(selectedCandidate);
      
    } catch (error: any) {
      console.error("Error recording vote:", error);
      toast.error(`Failed to record vote: ${error.message}`);
    } finally {
      setIsVoting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Prepare data for the chart
  const pollData = {
    id: election?.id || "",
    title: election?.question || "",
    description: "",
    creator: election?.creator || "",
    options: election?.options as unknown as PollOption[] || [],
    totalVotes: candidates?.reduce((sum, c) => sum + (c.votes_count || 0), 0) || 0,
    createdAt: new Date(election?.created_at || ""),
    endsAt: new Date(election?.end_time || ""),
    isElection: election?.is_election || false,
  };
  
  const isLoading = electionLoading || candidatesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 pb-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-pulse text-xl">Loading election details...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 pb-12">
          <div className="flex flex-col justify-center items-center min-h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">Election not found</h2>
            <p className="text-muted-foreground mb-8">The election you're looking for doesn't exist or has been removed.</p>
            <Link 
              to="/polls" 
              className={buttonVariants({ variant: "outline" })}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Polls
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="layout-container pt-24 pb-12">
        <div className="mb-6">
          <Link 
            to="/polls" 
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Polls
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{election.question}</CardTitle>
                <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>Created by {election.creator.substring(0, 6)}...{election.creator.substring(election.creator.length - 4)}</span>
                  </div>
                  <div className="hidden sm:block text-sm">•</div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {hasEnded
                        ? `Ended on ${formatDate(election.end_time)}`
                        : `Ends on ${formatDate(election.end_time)}`}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Candidates
                    </h3>
                    
                    {candidates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map((candidate) => (
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
                            userVoted={hasVoted ? userVote : undefined}
                            isElectionEnded={hasEnded}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-md bg-muted/20">
                        <p className="text-muted-foreground">No candidates found for this election</p>
                      </div>
                    )}
                  </div>
                  
                  {!hasEnded && !hasVoted && !!user && (
                    <div className="pt-4 border-t">
                      <Button 
                        disabled={!selectedCandidate || isVoting || hasVoted}
                        onClick={handleVote}
                        className="w-full"
                      >
                        {isVoting ? "Recording vote..." : "Submit Vote"}
                      </Button>
                      {!selectedCandidate && (
                        <p className="text-sm text-muted-foreground text-center mt-2">
                          Please select a candidate to vote
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!user && (
                    <div className="pt-4 border-t">
                      <Link to="/login" className={buttonVariants({ className: "w-full" })}>
                        Connect Wallet to Vote
                      </Link>
                    </div>
                  )}
                  
                  {hasVoted && (
                    <div className="pt-4 border-t text-center">
                      <p className="text-sm font-medium text-green-600 flex items-center justify-center">
                        Your vote has been recorded successfully!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results</CardTitle>
                <CardDescription>
                  {hasEnded 
                    ? "Final election results" 
                    : "Live election results"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidates.length > 0 ? (
                  <VoteChart poll={pollData} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No data to display</p>
                  </div>
                )}
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="flex items-center justify-between">
                    <span>Total votes:</span>
                    <span className="font-medium text-foreground">
                      {candidates.reduce((sum, c) => sum + (c.votes_count || 0), 0)}
                    </span>
                  </p>
                </div>
                
                {!hasEnded && (
                  <p className="mt-6 text-xs text-muted-foreground text-center">
                    Results will be finalized when the election ends
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetail;
