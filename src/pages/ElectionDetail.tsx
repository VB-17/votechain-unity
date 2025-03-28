
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import CandidateCard from "@/components/CandidateCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Clock, Calendar, User, AlertTriangle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  photoUrl?: string;
  verified: boolean;
  votesCount: number;
}

interface Election {
  id: string;
  question: string;
  description?: string;
  creator: string;
  createdAt: Date;
  endTime: Date;
}

const ElectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useSupabaseAuth();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);

  // Check if election has ended
  const isElectionEnded = election ? new Date(election.endTime) < new Date() : false;

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Get time remaining until election ends
  const getTimeRemaining = () => {
    if (!election) return "";
    
    const now = new Date();
    const end = new Date(election.endTime);
    
    if (now >= end) return "Ended";
    
    const diffMs = end.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    }
  };

  // Load election data and candidates
  useEffect(() => {
    const fetchElectionData = async () => {
      if (!id) {
        setError("Election ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Fetch election details
        const { data: pollData, error: pollError } = await supabase
          .from('polls')
          .select('*')
          .eq('id', id)
          .single();

        if (pollError) {
          throw new Error(pollError.message);
        }

        if (!pollData) {
          setError("Election not found");
          setLoading(false);
          return;
        }

        setElection({
          id: pollData.id,
          question: pollData.question,
          description: pollData.description,
          creator: pollData.creator,
          createdAt: new Date(pollData.created_at),
          endTime: new Date(pollData.end_time),
        });

        // Fetch candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('poll_id', id);

        if (candidatesError) {
          throw new Error(candidatesError.message);
        }

        setCandidates(
          candidatesData.map(candidate => ({
            id: candidate.id,
            name: candidate.name,
            position: candidate.position,
            bio: candidate.bio,
            photoUrl: candidate.photo_url,
            verified: candidate.verified || false,
            votesCount: candidate.votes_count || 0,
          }))
        );

        // Check if user has already voted
        if (user) {
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('candidate_id')
            .eq('poll_id', id)
            .eq('voter', user.id)
            .maybeSingle();

          if (!voteError && voteData) {
            setUserVote(voteData.candidate_id);
          }
        }
      } catch (error: any) {
        console.error("Error fetching election data:", error);
        setError(error.message || "Failed to load election data");
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [id, user]);

  // Handle voting for a candidate
  const handleVote = async (candidateId: string) => {
    if (!user) {
      toast.error("Please connect your wallet to vote");
      return;
    }

    if (isElectionEnded) {
      toast.error("This election has ended");
      return;
    }

    if (userVote) {
      toast.error("You have already voted in this election");
      return;
    }

    try {
      // Record vote in database
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          poll_id: id,
          candidate_id: candidateId,
          voter: user.id,
          vote: candidateId // For compatibility with existing votes table
        });

      if (voteError) {
        throw new Error(voteError.message);
      }

      // Update candidate vote count
      const { error: updateError } = await supabase.rpc('increment_candidate_votes', {
        candidate_id_param: candidateId
      });

      if (updateError) {
        console.error("Error updating vote count:", updateError);
        // Continue anyway as the vote was recorded
      }

      // Update local state
      setUserVote(candidateId);
      setCandidates(candidates.map(c => 
        c.id === candidateId 
          ? { ...c, votesCount: c.votesCount + 1 } 
          : c
      ));

      toast.success("Your vote has been recorded successfully");
    } catch (error: any) {
      console.error("Error casting vote:", error);
      toast.error(error.message || "Failed to record your vote");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 flex items-center justify-center">
          <div className="animate-pulse text-xl">Loading election data...</div>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="layout-container pt-24 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Election Not Found</h1>
            <p className="text-muted-foreground">{error || "The requested election could not be found"}</p>
          </div>
          <Button onClick={() => navigate('/polls')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Polls
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="layout-container pt-24">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/polls')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Polls
        </Button>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold">{election.question}</h1>
            <Badge 
              variant="outline" 
              className={`${
                isElectionEnded
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              } text-sm px-3 py-1`}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              {isElectionEnded ? "Election Ended" : "Active Election"}
            </Badge>
          </div>
          
          {election.description && (
            <p className="text-muted-foreground mb-4">{election.description}</p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground mr-1">Created:</span>
                {formatDate(election.createdAt)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                <span className="text-muted-foreground mr-1">Ends:</span>
                {formatDate(election.endTime)}
                {!isElectionEnded && (
                  <span className="ml-1 text-primary font-medium">
                    ({getTimeRemaining()})
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">Created by:</span>
              <span className="ml-1">{election.creator.substring(0, 6)}...{election.creator.substring(election.creator.length - 4)}</span>
            </div>
          </div>
        </div>

        {isElectionEnded && (
          <div className="mb-6 p-4 bg-primary/5 border rounded-lg">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Election Results</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              This election has ended. The results are displayed below.
            </p>
          </div>
        )}

        {candidates.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">No candidates found</h3>
            <p className="text-muted-foreground">
              There are no candidates registered for this election.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                pollId={election.id}
                onVote={handleVote}
                userVoted={userVote}
                isElectionEnded={isElectionEnded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectionDetail;
