import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { toast } from "sonner";
import { Clock, User, Users, Vote } from "lucide-react";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  creator: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: Date;
  endsAt?: Date;
  userVoted?: string;
  isElection: boolean;
}

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => void;
  compact?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onVote, compact = false }) => {
  const { user } = useSupabaseAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(
    poll.userVoted || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasVoted = Boolean(poll.userVoted);

  const handleVote = async () => {
    if (!user) {
      toast.error("Please connect your wallet to vote");
      return;
    }

    if (!selectedOption) {
      toast.error("Please select an option");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (onVote) {
        onVote(poll.id, selectedOption);
      }
      
      toast.success("Your vote has been recorded");
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

  const getTimeRemaining = () => {
    if (!poll.endsAt) return "No end date";
    
    const now = new Date();
    const end = new Date(poll.endsAt);
    const timeRemaining = end.getTime() - now.getTime();
    
    if (timeRemaining <= 0) return "Ended";
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    
    return `${minutes}m remaining`;
  };

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-soft ${compact ? 'h-full' : ''}`}>
      <CardHeader className="pb-3">
        {poll.isElection && (
          <div className="flex justify-end mb-1">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Election
            </span>
          </div>
        )}
        <CardTitle className="flex justify-between items-start">
          <span className="mr-4">{poll.title}</span>
        </CardTitle>
        {poll.description && !compact && (
          <p className="text-sm text-muted-foreground mt-2">{poll.description}</p>
        )}
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span>{formatAddress(poll.creator)}</span>
          </div>
          {poll.endsAt && (
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{getTimeRemaining()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={compact ? "pb-0" : ""}>
        {hasVoted || !user ? (
          <div className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className={option.id === poll.userVoted ? "font-medium" : ""}>
                    {option.text}
                  </span>
                  <span className="font-medium">{getPercentage(option.votes)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      option.id === poll.userVoted
                        ? "bg-primary"
                        : "bg-primary/40"
                    }`}
                    style={{ width: `${getPercentage(option.votes)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{poll.totalVotes} votes</span>
              </div>
              {hasVoted && (
                <span className="text-primary">You voted</span>
              )}
            </div>
          </div>
        ) : (
          <RadioGroup
            value={selectedOption || ""}
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {poll.options.map((option) => (
              <div
                key={option.id}
                className="flex items-center space-x-2 border rounded-md p-3 transition-colors hover:bg-muted/50"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-grow cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </CardContent>
      <CardFooter className={`${compact ? "pt-3" : "pt-6"}`}>
        {user && !hasVoted ? (
          <Button
            onClick={handleVote}
            disabled={!selectedOption || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Recording Vote..." : "Vote Now"}
            {!isSubmitting && <Vote className="ml-2 h-4 w-4" />}
          </Button>
        ) : !user ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.error("Please connect your wallet to vote")}
          >
            Connect wallet to vote
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
};

export default PollCard;
