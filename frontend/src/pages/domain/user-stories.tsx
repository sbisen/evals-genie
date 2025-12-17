import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UserStories() {
  const [, params] = useRoute("/domain/:id/user-stories");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState("");

  // Fetch user stories
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["userStories", domainId],
    queryFn: () => api.userStories.list(domainId),
    enabled: !!domainId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { story: string }) =>
      api.userStories.create(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", domainId] });
      setIsDialogOpen(false);
      setNewStory("");
      toast({
        title: "Success",
        description: "User story created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (storyId: string) => api.userStories.delete(domainId, storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories", domainId] });
      toast({
        title: "Success",
        description: "User story deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newStory.trim()) {
      toast({
        title: "Error",
        description: "Story text is required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ story: newStory });
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User Stories</h1>
            <p className="text-muted-foreground">Define the personas and goals for your agent evaluation.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Add Story
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">User Story</label>
                  <Textarea
                    placeholder="As a [role], I want to [action] so that [benefit]..."
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {createMutation.isPending ? "Creating..." : "Create Story"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading stories...</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No user stories yet. Click "Add Story" to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Card key={story.id} className="p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-relaxed text-slate-800">{story.story}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(story.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
