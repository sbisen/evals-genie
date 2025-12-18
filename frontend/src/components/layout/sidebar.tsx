import { Users, Database, MessageSquare, FileText, Settings, Home, ChevronRight, ChevronDown, HelpCircle, LogOut, LayoutDashboard, FileJson, BookOpen, Files, BarChart2, CheckSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { api, type User, type Domain } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import logo from "@assets/generated_images/minimalist_abstract_geometric_logo_for_ai_evaluation_platform.png";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isEvalOpen, setIsEvalOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("maps");

  // Fetch domains list
  const { data: domains, isLoading: isLoadingDomains } = useQuery({
    queryKey: ['domains'],
    queryFn: () => api.domains.list(),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.auth.getMe();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // If token is invalid, redirect to login
        setLocation("/login");
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [setLocation]);

  const handleSignOut = () => {
    api.auth.logout();
    setLocation("/login");
  };

  const isActive = (path: string) => location === path;

  // Get user initials for avatar
  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className={cn("flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground", className)}>
      {/* Header / Logo */}
      <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div className="font-semibold text-sm tracking-tight">
          <div className="text-sidebar-foreground">EvalsGenie</div>
          <div className="text-xs text-muted-foreground font-normal">EvalsGenie</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        
        {/* Main Section */}
        <div>
          <div className="px-2 mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Platform</div>
          <nav className="space-y-1">
            <Link href="/">
              <a className={cn("flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive("/") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50")}>
                <Home className="w-4 h-4" />
                Home
              </a>
            </Link>
          </nav>
        </div>

        {/* Domain Editor Section */}
        <div>
          <div className="px-2 mb-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Domain Editor</div>
          
          {/* Domain Selector */}
          <div className="px-2 mb-4">
            {isLoadingDomains ? (
              <div className="flex items-center gap-2 p-2 bg-background border rounded-md text-sm shadow-sm">
                <Database className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="font-medium text-muted-foreground">Loading...</span>
              </div>
            ) : domains && domains.length > 0 ? (
              <div className="flex items-center gap-2 p-2 bg-background border rounded-md text-sm shadow-sm">
                <Database className="w-4 h-4 text-indigo-500" />
                <span className="font-medium">{selectedDomain}</span>
                {domains.length > 1 && (
                  <span className="ml-auto text-xs text-muted-foreground">
                    ({domains.length} domains)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 bg-background border rounded-md text-sm shadow-sm">
                <Database className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">No domains</span>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            <Link href={`/domain/${selectedDomain}`}>
              <a className={cn("flex items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-colors",
                isActive(`/domain/${selectedDomain}`) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50")}>
                <Settings className="w-4 h-4" />
                Domain Settings
              </a>
            </Link>

            {/* Domain Context Group */}
            <div className="pt-2">
              <button
                onClick={() => setIsContextOpen(!isContextOpen)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent/50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Domain Context
                </div>
                {isContextOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              
              {isContextOpen && (
                <div className="mt-1 ml-4 pl-2 border-l border-sidebar-border space-y-1">
                  <Link href={`/domain/${selectedDomain}/training`}>
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(`/domain/${selectedDomain}/training`) ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      1. Agent Sample QnA
                    </a>
                  </Link>
                  <Link href={`/domain/${selectedDomain}/user-stories`}>
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(`/domain/${selectedDomain}/user-stories`) ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      2. Use Cases
                    </a>
                  </Link>
                  <Link href={`/domain/${selectedDomain}/prompts`}>
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(`/domain/${selectedDomain}/prompts`) ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      3. Prompts
                    </a>
                  </Link>
                   <Link href={`/domain/${selectedDomain}/rag-context`}>
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(`/domain/${selectedDomain}/rag-context`) ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      4. RAG Context
                    </a>
                  </Link>
                </div>
              )}
            </div>

            {/* Evaluation Group */}
             <div className="pt-2">
              <button 
                onClick={() => setIsEvalOpen(!isEvalOpen)}
                className="flex w-full items-center justify-between px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent/50"
              >
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Evaluation
                </div>
                {isEvalOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              
              {isEvalOpen && (
                <div className="mt-1 ml-4 pl-2 border-l border-sidebar-border space-y-1">
                  <Link href={`/domain/${selectedDomain}/test-sets`}>
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive(`/domain/${selectedDomain}/test-sets`) ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      Golden Test Set
                    </a>
                  </Link>
                  <Link href="/dashboard">
                    <a className={cn("block px-2 py-1.5 text-sm rounded-md transition-colors",
                      isActive("/dashboard") ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-muted-foreground hover:text-foreground")}>
                      Eval Metrics Dashboard
                    </a>
                  </Link>
                </div>
              )}
            </div>

          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {isLoadingUser ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="text-xs space-y-1">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium text-xs">
              {getUserInitials(user.email)}
            </div>
            <div className="text-xs">
              <div className="font-medium text-foreground">{user.email.split('@')[0]}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
          </div>
        ) : null}
        <div className="space-y-1">
            <a href="#" className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent/50">
                <HelpCircle className="w-3.5 h-3.5" />
                Help & Documentation
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent/50"
            >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
            </button>
        </div>
      </div>
    </div>
  );
}
