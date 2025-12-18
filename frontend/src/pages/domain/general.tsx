import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Domain, type DomainUpdate } from "@/lib/api";
import { useState, useEffect } from "react";

export default function DomainGeneral() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<DomainUpdate>({});

  // Fetch domain data (hardcoded to "maps" for MVP)
  const { data: domain, isLoading, error } = useQuery({
    queryKey: ['domain', 'maps'],
    queryFn: () => api.domains.get('maps'),
  });

  // Initialize form data when domain is loaded
  useEffect(() => {
    if (domain) {
      setFormData({
        alias: domain.alias,
        description: domain.description,
        dialect: domain.dialect,
        secret: domain.secret,
        schema_name: domain.schema_name,
        retriever_top_k: domain.retriever_top_k,
        is_active: domain.is_active,
      });
    }
  }, [domain]);

  // Update domain mutation
  const updateMutation = useMutation({
    mutationFn: (data: DomainUpdate) => api.domains.update('maps', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domain', 'maps'] });
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast({
        title: "Success",
        description: "Domain updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update domain",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="text-center text-red-600">
            <p className="text-lg font-semibold">Error loading domain</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!domain) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-semibold">Domain not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Domain</h1>
            <p className="text-muted-foreground">Manage domain information</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border rounded-full shadow-sm">
            <span className="text-sm font-medium text-muted-foreground">Is it active?</span>
            <Switch 
              checked={formData.is_active ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <Card className="shadow-sm border-border/60">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agent_name">Agent Name/ID: *</Label>
              <Input
                id="agent_name"
                placeholder="e.g., Finance Agent, DevOps Agent, Ads Agent"
                value={formData.alias ?? ''}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">
                This agent name will be used across all Domain Context sections (Agent I/O, User Stories, Prompts, RAG Context, Sample Q&A)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description:</Label>
              <Textarea
                id="description"
                placeholder="Describe what this agent does and its purpose..."
                value={formData.description ?? ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Configuration</h2>
          <Card className="shadow-sm border-border/60">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dialect">Dialect:</Label>
                <Select 
                  value={formData.dialect ?? ''} 
                  onValueChange={(value) => setFormData({ ...formData, dialect: value })}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select dialect" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Snowflake">Snowflake</SelectItem>
                    <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    <SelectItem value="BigQuery">BigQuery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Secret:*</Label>
                <Input 
                  id="secret" 
                  value={formData.secret ?? ''} 
                  onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                  className="max-w-md" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schema">Schema:*</Label>
                <Input 
                  id="schema" 
                  value={formData.schema_name ?? ''} 
                  onChange={(e) => setFormData({ ...formData, schema_name: e.target.value })}
                  className="max-w-md" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retriever">Retriever Top columns:</Label>
                <Input 
                  id="retriever" 
                  type="number" 
                  value={formData.retriever_top_k ?? 10} 
                  onChange={(e) => setFormData({ ...formData, retriever_top_k: parseInt(e.target.value) || 10 })}
                  className="max-w-md" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="min-w-[100px]"
          >
            {updateMutation.isPending ? <Spinner size="sm" /> : 'Save'}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
