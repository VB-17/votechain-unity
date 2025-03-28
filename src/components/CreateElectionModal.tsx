
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, User, Upload } from "lucide-react";
import { toast } from "sonner";
import { Poll } from "./PollCard";
import { useSupabaseAuth } from "@/context/SuperbaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Candidate {
  id?: string;
  name: string;
  position?: string;
  bio?: string;
  photoUrl?: string;
}

interface CreateElectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onElectionCreated: (poll: Poll) => void;
}

const CreateElectionModal: React.FC<CreateElectionModalProps> = ({
  open,
  onOpenChange,
  onElectionCreated,
}) => {
  const { user } = useSupabaseAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: "1", name: "", position: "", bio: "" },
    { id: "2", name: "", position: "", bio: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ["Election Details", "Add Candidates"];

  const handleAddCandidate = () => {
    if (candidates.length >= 10) {
      toast.error("Maximum 10 candidates allowed");
      return;
    }
    setCandidates([...candidates, { id: Date.now().toString(), name: "", position: "", bio: "" }]);
  };

  const handleRemoveCandidate = (id: string) => {
    if (candidates.length <= 2) {
      toast.error("Minimum 2 candidates required");
      return;
    }
    setCandidates(candidates.filter((candidate) => candidate.id !== id));
  };

  const handleCandidateChange = (id: string, field: keyof Candidate, value: string) => {
    setCandidates(
      candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, [field]: value } : candidate
      )
    );
  };

  const goToNextStep = () => {
    if (currentStep === 0) {
      // Validate first step
      if (!title.trim()) {
        toast.error("Please enter an election title");
        return;
      }
      if (!endDate) {
        toast.error("Please set an end date for the election");
        return;
      }
      setCurrentStep(1);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!endDate) {
      toast.error("Please set an end date");
      return;
    }

    if (candidates.some((candidate) => !candidate.name.trim())) {
      toast.error("Please fill all candidate names");
      return;
    }

    if (new Set(candidates.map((c) => c.name.trim())).size !== candidates.length) {
      toast.error("Candidate names must be unique");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the election (poll) in Supabase
      const pollData = {
        question: title,
        description: description || null,
        creator: user?.id || "unknown",
        end_time: new Date(endDate).toISOString(),
        is_election: true,
        options: JSON.stringify(candidates.map(c => ({ text: c.name })))
      };

      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert(pollData)
        .select('*')
        .single();

      if (pollError) {
        throw new Error(`Failed to create election: ${pollError.message}`);
      }

      // 2. Add candidates to the candidates table
      const candidatesData = candidates.map(candidate => ({
        name: candidate.name,
        bio: candidate.bio || null,
        position: candidate.position || null,
        poll_id: pollData.id,
        wallet_address: null, // To be updated later if candidates register
        photo_url: null // To be updated later
      }));

      const { error: candidatesError } = await supabase
        .from('candidates')
        .insert(candidatesData);

      if (candidatesError) {
        throw new Error(`Failed to add candidates: ${candidatesError.message}`);
      }

      // 3. Create a Poll object for the frontend
      const newPoll: Poll = {
        id: pollData.id,
        title: pollData.question,
        description: description || undefined,
        creator: pollData.creator,
        options: candidates.map((c, i) => ({
          id: `c-${i}`,
          text: c.name,
          votes: 0,
        })),
        totalVotes: 0,
        createdAt: new Date(),
        endsAt: new Date(endDate),
        isElection: true,
      };

      onElectionCreated(newPoll);
      toast.success("Election created successfully");
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error creating election:", error);
      toast.error(error.message || "Failed to create election. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCandidates([
      { id: "1", name: "", position: "", bio: "" },
      { id: "2", name: "", position: "", bio: "" },
    ]);
    setEndDate("");
    setCurrentStep(0);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Election Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Student Council President Election"
                maxLength={100}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context about this election..."
                rows={3}
                maxLength={300}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Elections require an end date to determine when voting closes.
              </p>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Candidates</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCandidate}
                disabled={candidates.length >= 10 || isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Candidate
              </Button>
            </div>
            
            <div className="space-y-4">
              {candidates.map((candidate, index) => (
                <div key={candidate.id} className="border rounded-md p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Candidate {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCandidate(candidate.id!)}
                      disabled={candidates.length <= 2 || isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`name-${candidate.id}`}>Name</Label>
                      <Input
                        id={`name-${candidate.id}`}
                        value={candidate.name}
                        onChange={(e) => handleCandidateChange(candidate.id!, "name", e.target.value)}
                        placeholder="Candidate's full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`position-${candidate.id}`}>Position (optional)</Label>
                      <Input
                        id={`position-${candidate.id}`}
                        value={candidate.position}
                        onChange={(e) => handleCandidateChange(candidate.id!, "position", e.target.value)}
                        placeholder="e.g., Junior, Senior, Faculty"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`bio-${candidate.id}`}>Bio (optional)</Label>
                      <Textarea
                        id={`bio-${candidate.id}`}
                        value={candidate.bio}
                        onChange={(e) => handleCandidateChange(candidate.id!, "bio", e.target.value)}
                        placeholder="Brief biography or candidate statement"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new election</DialogTitle>
            <DialogDescription>
              Set up an election with candidates for voters to select from. All election data is stored on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full mb-4 mt-2">
            <div className="flex justify-between items-center">
              {steps.map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        i <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-full ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {renderStep()}

          <DialogFooter>
            <div className="flex justify-between w-full">
              <div>
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPrevStep}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    disabled={isSubmitting}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Election"}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateElectionModal;
