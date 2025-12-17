import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api, RagDocument } from "@/lib/api";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RagContext() {
  const [, params] = useRoute("/domain/:id/rag-context");
  const domainId = params?.id || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", domainId],
    queryFn: () => api.documents.list(domainId!),
    enabled: !!domainId,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.documents.upload(domainId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", domainId] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (docId: string) => api.documents.delete(domainId!, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", domainId] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setIsUploading(true);
      uploadMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RAG Context</h1>
            <p className="text-muted-foreground">Upload documents or provide key terms to ground your agent.</p>
          </div>
          <Button 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4" />
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.md,.docx"
        />

        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:bg-slate-50/50 transition-colors cursor-pointer"
          onClick={handleDropAreaClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-slate-900">Click to upload or drag and drop</h3>
          <p className="text-sm text-muted-foreground mt-1">PDF, TXT, MD or DOCX (max 10MB)</p>
        </div>

        {/* File List */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Indexed Documents ({documents.length})
          </h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet. Upload your first document to get started.
            </div>
          ) : (
            documents.map((doc: RagDocument) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-slate-900">{doc.filename}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)} • Uploaded {formatDate(doc.uploaded_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(doc.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
