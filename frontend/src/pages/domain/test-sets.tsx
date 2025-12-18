import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, CheckCircle2, XCircle, AlertCircle, Plus, Trash2, CheckCircle } from "lucide-react";
import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, TestSet, TestSetCreate } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function TestSets() {
  const [, params] = useRoute("/domain/:id/test-sets");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showTestSets, setShowTestSets] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [newTestSet, setNewTestSet] = useState<TestSetCreate>({
    question: "",
    ground_truth: "",
    difficulty: "medium",
  });

  // Fetch test sets
  const { data: testSets = [], isLoading } = useQuery({
    queryKey: ["testSets", domainId],
    queryFn: () => api.testSets.list(domainId!),
    enabled: !!domainId,
  });

  // Fetch metrics for production readiness
  const { data: metrics } = useQuery({
    queryKey: ["metrics", domainId],
    queryFn: () => api.evaluation.getMetrics(domainId!),
    enabled: !!domainId,
  });

  // Calculate production readiness
  const isProductionReady = metrics && metrics.pass_rate >= 90;
  const readinessStatus = isProductionReady ? "Production Ready" : "Needs Improvement";

  // Create test set mutation
  const createMutation = useMutation({
    mutationFn: (data: TestSetCreate) => api.testSets.create(domainId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testSets", domainId] });
      setIsAddDialogOpen(false);
      setNewTestSet({ question: "", ground_truth: "", difficulty: "medium" });
      toast({
        title: "Success",
        description: "Test set created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create test set: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete test set mutation
  const deleteMutation = useMutation({
    mutationFn: (testSetId: string) => api.testSets.delete(domainId!, testSetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testSets", domainId] });
      toast({
        title: "Success",
        description: "Test set deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete test set: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Run evaluation mutation
  const runEvalMutation = useMutation({
    mutationFn: () => api.evaluation.run(domainId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["testSets", domainId] });
      queryClient.invalidateQueries({ queryKey: ["metrics", domainId] });
      setShowResults(true);
      toast({
        title: "Success",
        description: `Evaluation completed! Evaluated ${(data as any).test_sets_evaluated} test sets.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to run evaluation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateTestSet = () => {
    if (!newTestSet.question || !newTestSet.ground_truth) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newTestSet);
  };

  const handleDelete = (testSetId: string) => {
    if (confirm("Are you sure you want to delete this test set?")) {
      deleteMutation.mutate(testSetId);
    }
  };

  const getStatusIcon = (status?: string | null) => {
    if (!status) return null;
    switch (status) {
      case "pass":
        return <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm"><CheckCircle2 className="w-4 h-4" /> Pass</div>;
      case "fail":
        return <div className="flex items-center gap-1.5 text-rose-600 font-medium text-sm"><XCircle className="w-4 h-4" /> Fail</div>;
      case "warn":
        return <div className="flex items-center gap-1.5 text-amber-600 font-medium text-sm"><AlertCircle className="w-4 h-4" /> Partial</div>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {!showTestSets ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">Golden Test Set (Ground Truth)</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Generate evaluation questions and expected answers to test your AI agent's performance and accuracy.
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 px-8 py-6 text-lg"
              onClick={() => setShowTestSets(true)}
            >
              <Play className="w-5 h-5" />
              Generate Golden Test Set
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Golden Test Set (Ground Truth)</h1>
                <p className="text-muted-foreground">Generated evaluation questions and expected answers.</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Test Set
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Test Set</DialogTitle>
                  <DialogDescription>
                    Create a new evaluation question with ground truth answer.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="question">Question *</Label>
                    <Textarea
                      id="question"
                      placeholder="Enter evaluation question..."
                      value={newTestSet.question}
                      onChange={(e) => setNewTestSet({ ...newTestSet, question: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ground_truth">Golden Answer *</Label>
                    <Textarea
                      id="ground_truth"
                      placeholder="Enter expected answer..."
                      value={newTestSet.ground_truth}
                      onChange={(e) => setNewTestSet({ ...newTestSet, ground_truth: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={newTestSet.difficulty}
                      onValueChange={(value) => setNewTestSet({ ...newTestSet, difficulty: value })}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTestSet} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Test Set"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
              onClick={() => runEvalMutation.mutate()}
              disabled={runEvalMutation.isPending || testSets.length === 0}
            >
              <Play className="w-4 h-4" />
              {runEvalMutation.isPending ? "Running..." : "Run Evaluation"}
            </Button>
          </div>
        </div>

        {/* Production Readiness Section */}
        {showResults && metrics && (
          <Card className="border-2 border-green-200 bg-green-50/30">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Production Readiness</h2>
                <Badge
                  className={`text-sm px-4 py-1 ${
                    isProductionReady
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                >
                  {readinessStatus}
                </Badge>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isProductionReady ? "bg-green-600" : "bg-amber-600"
                }`}>
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg text-gray-700">
                    {isProductionReady
                      ? "This agent meets all production quality standards and is ready for deployment."
                      : "This agent needs improvement before production deployment."}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics:</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Accuracy:</span>
                    <span className={`font-semibold text-lg ${
                      metrics.pass_rate >= 90 ? "text-green-600" : "text-amber-600"
                    }`}>
                      {metrics.pass_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Hallucination:</span>
                    <span className={`font-semibold text-lg ${
                      metrics.hallucination_rate <= 5 ? "text-green-600" : "text-amber-600"
                    }`}>
                      {metrics.hallucination_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confidence Score:</span>
                    <span className="font-semibold text-lg text-green-600">
                      {(100 - metrics.hallucination_rate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Consistency:</span>
                    <span className="font-semibold text-lg text-green-600">
                      {metrics.overall_score.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {isProductionReady ? (
                    <li>Continue monitoring performance to maintain production quality</li>
                  ) : (
                    <>
                      {metrics.pass_rate < 90 && (
                        <li>Improve accuracy to at least baseline 90% before production deployment</li>
                      )}
                      {metrics.hallucination_rate > 5 && (
                        <li>Reduce hallucination rate to below 5% for production readiness by grounding the prompt with actual data variables</li>
                      )}
                      <li>Add more test cases to improve coverage and reliability for edge cases</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-white rounded-lg border shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading test sets...</div>
          ) : testSets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No test sets yet. Click "Add Test Set" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="w-[400px]">Evaluation Question</TableHead>
                  <TableHead className="w-[300px]">Golden Answer</TableHead>
                  {showResults && <TableHead>Last Result</TableHead>}
                  {showResults && <TableHead className="w-[140px]">Confidence Score</TableHead>}
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testSets.map((testSet) => (
                  <TableRow key={testSet.id}>
                    <TableCell className="font-medium py-4">{testSet.question}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{testSet.ground_truth}</TableCell>
                    {showResults && (
                      <TableCell>
                        {testSet.last_status ? getStatusIcon(testSet.last_status) : (
                          <span className="text-sm text-muted-foreground">Not evaluated</span>
                        )}
                      </TableCell>
                    )}
                    {showResults && (
                      <TableCell>
                        {testSet.confidence_score !== null && testSet.confidence_score !== undefined ? (
                          <span className="text-sm font-medium">{testSet.confidence_score.toFixed(1)}%</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(testSet.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
          </>
        )}
      </div>
    </Layout>
  );
}
