import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api, type Prompt, type PromptCreate } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DomainPrompts() {
  const [, params] = useRoute("/domain/:id/prompts");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<PromptCreate>({
    key: "",
    type: "",
    content: "",
  });

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["prompts", domainId],
    queryFn: () => api.prompts.list(domainId),
    enabled: !!domainId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: PromptCreate) => api.prompts.create(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", domainId] });
      setIsCreateDialogOpen(false);
      setFormData({ key: "", type: "", content: "" });
      toast({
        title: "Success",
        description: "Prompt created successfully",
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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromptCreate> }) =>
      api.prompts.update(domainId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", domainId] });
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      toast({
        title: "Success",
        description: "Prompt updated successfully",
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
    mutationFn: (promptId: string) => api.prompts.delete(domainId, promptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", domainId] });
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
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
    if (!formData.key.trim() || !formData.type.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({ key: prompt.key, type: prompt.type, content: prompt.content });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingPrompt) return;
    if (!formData.key.trim() || !formData.type.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingPrompt.id, data: formData });
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customize Eval Prompt</h1>
            <p className="text-muted-foreground">Additional prompt instructions to guide the model for this domain.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Key</label>
                  <Input
                    placeholder="e.g., system_prompt"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Input
                    placeholder="e.g., system, user, assistant"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Enter prompt content..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {createMutation.isPending ? "Creating..." : "Create Prompt"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading prompts...</div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No prompts yet. Click "Add Prompt" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[50px]">Row</TableHead>
                  <TableHead className="w-[150px]">Key</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Prompt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prompts.map((p, i) => (
                  <TableRow key={p.id} className="group">
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.key}</TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">{p.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground leading-relaxed py-4">{p.content}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(p)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteMutation.mutate(p.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Key</label>
                <Input
                  placeholder="e.g., system_prompt"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Input
                  placeholder="e.g., system, user, assistant"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Enter prompt content..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateMutation.isPending ? "Updating..." : "Update Prompt"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
