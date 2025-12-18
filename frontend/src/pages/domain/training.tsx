import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api, type TrainingExample, type TrainingExampleCreate } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DomainTraining() {
  const [, params] = useRoute("/domain/:id/training");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExample, setEditingExample] = useState<TrainingExample | null>(null);
  const [formData, setFormData] = useState<TrainingExampleCreate>({
    question: "",
    golden_answer: "",
  });

  // Fetch training examples
  const { data: examples = [], isLoading } = useQuery({
    queryKey: ["trainingExamples", domainId],
    queryFn: () => api.trainingExamples.list(domainId),
    enabled: !!domainId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TrainingExampleCreate) =>
      api.trainingExamples.create(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingExamples", domainId] });
      setIsCreateDialogOpen(false);
      setFormData({ question: "", golden_answer: "" });
      toast({
        title: "Success",
        description: "Training example created successfully",
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
    mutationFn: ({ id, data }: { id: string; data: Partial<TrainingExampleCreate> }) =>
      api.trainingExamples.update(domainId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingExamples", domainId] });
      setIsEditDialogOpen(false);
      setEditingExample(null);
      toast({
        title: "Success",
        description: "Training example updated successfully",
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
    mutationFn: (exampleId: string) =>
      api.trainingExamples.delete(domainId, exampleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainingExamples", domainId] });
      toast({
        title: "Success",
        description: "Training example deleted successfully",
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
    if (!formData.question.trim() || !formData.golden_answer.trim()) {
      toast({
        title: "Error",
        description: "Question and Golden Answer are required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (example: TrainingExample) => {
    setEditingExample(example);
    setFormData({ question: example.question, golden_answer: example.golden_answer });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingExample) return;
    if (!formData.question.trim() || !formData.golden_answer.trim()) {
      toast({
        title: "Error",
        description: "Question and Golden Answer are required",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({ id: editingExample.id, data: formData });
  };

  const handleDelete = (exampleId: string) => {
    if (confirm("Are you sure you want to delete this training example?")) {
      deleteMutation.mutate(exampleId);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Training examples</h1>
            <p className="text-muted-foreground">Fewshot examples to help ViaQuery how to answer questions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Add example
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Training Example</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question</label>
                  <Textarea
                    placeholder="Enter the training question..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Golden Answer</label>
                  <Textarea
                    placeholder="Enter the expected/golden answer..."
                    value={formData.golden_answer}
                    onChange={(e) => setFormData({ ...formData, golden_answer: e.target.value })}
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
                  {createMutation.isPending ? "Creating..." : "Create Example"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading examples...</div>
        ) : examples.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No training examples yet. Click "Add example" to create one.
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[50px]">Row</TableHead>
                  <TableHead className="w-[400px]">Question</TableHead>
                  <TableHead>Golden Answer</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examples.map((ex, index) => (
                  <TableRow key={ex.id} className="group">
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium leading-relaxed py-4">{ex.question}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono leading-relaxed py-4">
                      {ex.golden_answer}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(ex)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(ex.id)}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Training Example</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question</label>
                <Textarea
                  placeholder="Enter the training question..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Golden Answer</label>
                <Textarea
                  placeholder="Enter the expected/golden answer..."
                  value={formData.golden_answer}
                  onChange={(e) => setFormData({ ...formData, golden_answer: e.target.value })}
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
                {updateMutation.isPending ? "Updating..." : "Update Example"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
