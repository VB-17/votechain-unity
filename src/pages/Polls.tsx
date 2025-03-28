
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PollCard, { Poll } from "@/components/PollCard";
import CreatePollModal from "@/components/CreatePollModal";
import CreateElectionModal from "@/components/CreateElectionModal";
import { Button } from "@/components/ui/button";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { Plus, Filter, Vote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Sample data for demonstration
const MOCK_POLLS: Poll[] = [
  {
    id: "1",
    title: "Best Programming Language",
    description: "Which programming language do you prefer to work with?",
    creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    options: [
      { id: "1a", text: "JavaScript", votes: 42 },
      { id: "1b", text: "Python", votes: 38 },
      { id: "1c", text: "Java", votes: 15 },
      { id: "1d", text: "C#", votes: 18 },
      { id: "1e", text: "Rust", votes: 8 },
    ],
    totalVotes: 121,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    isElection: false,
  },
  {
    id: "2",
    title: "Campus Wi-Fi Improvements",
    description: "What should we prioritize for campus Wi-Fi upgrades?",
    creator: "0x5A1b342d1f32e6Ac88699B697dba3b55c8110d64",
    options: [
      { id: "2a", text: "Expanded Coverage", votes: 65 },
      { id: "2b", text: "Faster Speeds", votes: 87 },
      { id: "2c", text: "More Reliable Connection", votes: 52 },
    ],
    totalVotes: 204,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    isElection: false,
  },
  {
    id: "3",
    title: "College President Election 2023",
    description: "Vote for your preferred candidate for college president.",
    creator: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    options: [
      { id: "3a", text: "Candidate A", votes: 145 },
      { id: "3b", text: "Candidate B", votes: 105 },
    ],
    totalVotes: 250,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isElection: true,
  },
  {
    id: "4",
    title: "Cafeteria Menu Selection",
    description: "What cuisines would you like to see more of in the cafeteria?",
    creator: "0x8Bc965C48B18f3D3853172b7A3D0D7bA76C74544",
    options: [
      { id: "4a", text: "Italian", votes: 28 },
      { id: "4b", text: "Mexican", votes: 35 },
      { id: "4c", text: "Chinese", votes: 42 },
      { id: "4d", text: "Indian", votes: 30 },
    ],
    totalVotes: 135,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isElection: false,
  },
];

const Polls: React.FC = () => {
  const { user, profile } = useSupabaseAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);
  const [createPollOpen, setCreatePollOpen] = useState(false);
  const [createElectionOpen, setCreateElectionOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading polls from blockchain
    const loadPolls = async () => {
      try {
        setLoaded(false);
        // In a real implementation, this would fetch from Supabase
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPolls(MOCK_POLLS);
        setFilteredPolls(MOCK_POLLS);
      } catch (error) {
        console.error("Error loading polls:", error);
        toast.error("Failed to load polls");
      } finally {
        setLoaded(true);
      }
    };

    loadPolls();
  }, []);

  useEffect(() => {
    // Log authentication state for debugging
    console.log("Auth state in Polls:", { user, profile });
  }, [user, profile]);

  const handleCreatePoll = (newPoll: Poll) => {
    const updatedPolls = [newPoll, ...polls];
    setPolls(updatedPolls);
    applyFilter(filter, updatedPolls);
  };

  const handleVote = (pollId: string, optionId: string) => {
    const updatedPolls = polls.map((poll) => {
      if (poll.id === pollId) {
        const updatedOptions = poll.options.map((option) => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          userVoted: optionId,
        };
      }
      return poll;
    });

    setPolls(updatedPolls);
    applyFilter(filter, updatedPolls);
  };

  const applyFilter = (value: string, pollsToFilter = polls) => {
    setFilter(value);
    switch (value) {
      case "active":
        setFilteredPolls(
          pollsToFilter.filter((poll) => {
            if (!poll.endsAt) return true;
            return new Date(poll.endsAt) > new Date();
          })
        );
        break;
      case "ended":
        setFilteredPolls(
          pollsToFilter.filter((poll) => {
            if (!poll.endsAt) return false;
            return new Date(poll.endsAt) <= new Date();
          })
        );
        break;
      case "elections":
        setFilteredPolls(pollsToFilter.filter((poll) => poll.isElection));
        break;
      case "polls":
        setFilteredPolls(pollsToFilter.filter((poll) => !poll.isElection));
        break;
      case "voted":
        setFilteredPolls(pollsToFilter.filter((poll) => poll.userVoted));
        break;
      default:
        setFilteredPolls(pollsToFilter);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="layout-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Explore Polls</h1>
              <p className="text-muted-foreground">
                Browse and vote on community polls and elections
              </p>
            </div>

            <div className="flex mt-4 md:mt-0 space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={filter}
                    onValueChange={(value) => applyFilter(value)}
                  >
                    <DropdownMenuRadioItem value="all">
                      All
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="active">
                      Active
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ended">
                      Ended
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="elections">
                      Elections Only
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="polls">
                      Polls Only
                    </DropdownMenuRadioItem>
                    {user && (
                      <DropdownMenuRadioItem value="voted">
                        Voted By Me
                      </DropdownMenuRadioItem>
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="whitespace-nowrap">
                      <Plus className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>What do you want to create?</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioItem value="poll" onClick={() => setCreatePollOpen(true)}>
                      Create a Poll
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="election" onClick={() => setCreateElectionOpen(true)}>
                      Create an Election
                    </DropdownMenuRadioItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {!loaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-muted/50 rounded-lg h-[350px] animate-pulse"
                ></div>
              ))}
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium mb-2">No polls found</h3>
              <p className="text-muted-foreground mb-8">
                {filter !== "all"
                  ? "Try changing your filter to see more polls"
                  : "Be the first to create a poll!"}
              </p>
              {user && filter === "all" && (
                <div className="flex space-x-4 justify-center">
                  <Button onClick={() => setCreatePollOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Poll
                  </Button>
                  <Button onClick={() => setCreateElectionOpen(true)} variant="outline">
                    <Vote className="h-4 w-4 mr-2" />
                    Create Election
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredPolls.map((poll) => (
                <div key={poll.id}>
                  {poll.isElection ? (
                    <Link to={`/elections/${poll.id}`} className="block h-full">
                      <PollCard poll={poll} compact />
                    </Link>
                  ) : (
                    <PollCard
                      key={poll.id}
                      poll={poll}
                      onVote={handleVote}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreatePollModal
        open={createPollOpen}
        onOpenChange={setCreatePollOpen}
        onPollCreated={handleCreatePoll}
      />
      
      <CreateElectionModal
        open={createElectionOpen}
        onOpenChange={setCreateElectionOpen}
        onElectionCreated={handleCreatePoll}
      />
    </div>
  );
};

export default Polls;
