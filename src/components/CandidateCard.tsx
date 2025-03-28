
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Vote, Check, X } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  position?: string;
  bio?: string;
  photoUrl?: string;
  verified: boolean;
  votesCount: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  pollId: string;
  onVote?: (candidateId: string) => void;
  userVoted?: string;
  isElectionEnded?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  pollId,
  onVote,
  userVoted,
  isElectionEnded,
}) => {
  const { user } = useSupabaseAuth();
  const hasVoted = !!userVoted;
  const isVotedForThisCandidate = userVoted === candidate.id;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-16 w-16">
            {candidate.photoUrl ? (
              <AvatarImage src={candidate.photoUrl} alt={candidate.name} />
            ) : (
              <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              {candidate.name}
              {candidate.verified && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </h3>
            {candidate.position && (
              <p className="text-sm text-muted-foreground">{candidate.position}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        {candidate.bio ? (
          <p className="text-sm">{candidate.bio}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No candidate statement provided</p>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-2 flex-col items-stretch">
        {isElectionEnded ? (
          <div className="text-center w-full py-2 font-medium">
            {candidate.votesCount} {candidate.votesCount === 1 ? 'vote' : 'votes'}
          </div>
        ) : user ? (
          hasVoted ? (
            <Button
              variant={isVotedForThisCandidate ? "default" : "ghost"}
              className="w-full"
              disabled
            >
              {isVotedForThisCandidate ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Voted
                </>
              ) : "Already voted"}
            </Button>
          ) : (
            <Button 
              className="w-full"
              onClick={() => onVote && onVote(candidate.id)}
            >
              <Vote className="h-4 w-4 mr-2" />
              Vote
            </Button>
          )
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Connect wallet to vote
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
