import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AgentIO() {
  const [, params] = useRoute("/domain/:id/agent-io");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInput, setNewInput] = useState("");
  const [newOutput, setNewOutput] = useState("");

  // Fetch agent I/O samples
  const { data: samples = [], isLoading } = useQuery({
    queryKey: ["agentIO", domainId],
    queryFn: () => api.agentIO.list(domainId),
    enabled: !!domainId,
  });

  // Fetch domain to get agent name
  const { data: domain } = useQuery({
    queryKey: ["domain", domainId],
    queryFn: () => api.domains.get(domainId),
    enabled: !!domainId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { input: string; output: string }) =>
      api.agentIO.create(domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentIO", domainId] });
      setIsDialogOpen(false);
      setNewInput("");
      setNewOutput("");
      toast({
        title: "Success",
        description: "Agent I/O sample created successfully",
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
    mutationFn: (sampleId: string) => api.agentIO.delete(domainId, sampleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentIO", domainId] });
      toast({
        title: "Success",
        description: "Agent I/O sample deleted successfully",
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
    if (!newInput.trim() || !newOutput.trim()) {
      toast({
        title: "Error",
        description: "Both input and output are required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ input: newInput, output: newOutput });
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {domain?.alias && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-indigo-900">Agent:</span>
              <span className="text-sm font-bold text-indigo-600">{domain.alias}</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Input/Output Samples</h1>
            <p className="text-muted-foreground">Define the expected behavior of your agent with real examples.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4" />
                Add Sample
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Add Agent I/O Sample</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent Input (JSON)</label>
                  <Textarea
                    placeholder='{"query": "What is the forecast?", "user_id": "12345"}'
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    className="font-mono min-h-[200px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expected Output (JSON)</label>
                  <Textarea
                    placeholder='{"forecast_amount": 1500000, "confidence": 0.95}'
                    value={newOutput}
                    onChange={(e) => setNewOutput(e.target.value)}
                    className="font-mono min-h-[200px]"
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
                  {createMutation.isPending ? "Creating..." : "Create Sample"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading samples...</div>
        ) : samples.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No Agent I/O samples yet. Click "Add Sample" to create one.
          </div>
        ) : (
          <div className="grid gap-6">
            {samples.map((sample, index) => (
              <Card key={sample.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sample #{index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(sample.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Agent Input</label>
                    <div className="p-3 bg-slate-50 rounded-md text-sm font-mono border min-h-[100px] whitespace-pre-wrap break-words">
                      {sample.input}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Expected Output</label>
                    <div className="p-3 bg-slate-50 rounded-md text-sm font-mono border min-h-[100px] whitespace-pre-wrap break-words">
                      {sample.output}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
