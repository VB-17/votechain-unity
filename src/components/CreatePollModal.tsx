
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
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Poll, PollOption } from "./PollCard";
import { useAuth } from "@/context/AuthContext";

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPollCreated: (poll: Poll) => void;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({
  open,
  onOpenChange,
  onPollCreated,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: "1", text: "" },
    { id: "2", text: "" },
  ]);
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length >= 10) {
      toast.error("Maximum 10 options allowed");
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: "" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error("Minimum 2 options required");
      return;
    }
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (options.some((option) => !option.text.trim())) {
      toast.error("Please fill all options");
      return;
    }

    if (new Set(options.map((o) => o.text.trim())).size !== options.length) {
      toast.error("Options must be unique");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newPoll: Poll = {
        id: Date.now().toString(),
        title,
        description: description || undefined,
        creator: user?.address || "unknown",
        options: options.map((option) => ({
          id: option.id,
          text: option.text,
          votes: 0,
        })),
        totalVotes: 0,
        createdAt: new Date(),
        endsAt: endDate ? new Date(endDate) : undefined,
        isElection: false, // Regular users can only create polls, not elections
      };

      onPollCreated(newPoll);
      toast.success("Poll created successfully");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOptions([
      { id: "1", text: "" },
      { id: "2", text: "" },
    ]);
    setEndDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a new poll</DialogTitle>
            <DialogDescription>
              Create a poll for others to vote on. All polls are stored on the blockchain.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your poll about?"
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
                placeholder="Add some context to your poll..."
                rows={3}
                maxLength={300}
              />
            </div>

            <div className="grid gap-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(option.id, e.target.value)
                      }
                      placeholder={`Option ${options.findIndex(
                        (o) => o.id === option.id
                      ) + 1}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                      disabled={options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleAddOption}
                  disabled={options.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date (optional)</Label>
              <Input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">
                If no end date is set, the poll will remain active indefinitely.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollModal;
