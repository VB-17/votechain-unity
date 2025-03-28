
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PollCard, { Poll } from "@/components/PollCard";
import VoteChart from "@/components/VoteChart";

interface PollsListProps {
  polls: Poll[];
  loading: boolean;
}

const PollsList: React.FC<PollsListProps> = ({ polls, loading }) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Polls You've Created</h2>
        <Button className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create New Poll
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-muted/50 rounded-lg h-[350px] animate-pulse"
            ></div>
          ))}
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium mb-2">No polls created yet</h3>
          <p className="text-muted-foreground mb-8">
            Create your first poll to gather votes on topics that matter to you
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Poll
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {polls.map((poll) => (
            <div key={poll.id} className="border rounded-xl p-6 bg-background/50">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PollCard poll={poll} />
                </div>
                <div>
                  <VoteChart poll={poll} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PollsList;
