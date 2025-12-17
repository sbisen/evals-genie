import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import DomainGeneral from "./pages/domain/general";
import DomainSchemas from "./pages/domain/schemas";
import DomainTraining from "./pages/domain/training";
import DomainPrompts from "./pages/domain/prompts";
import AgentIO from "./pages/domain/agent-io";
import UserStories from "./pages/domain/user-stories";
import RagContext from "./pages/domain/rag-context";
import TestSets from "./pages/domain/test-sets";
import MetricsDashboard from "./pages/domain/metrics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Domain Editor Routes */}
      <Route path="/domain/:id" component={DomainGeneral} />
      
      {/* New Context Routes */}
      <Route path="/domain/:id/agent-io" component={AgentIO} />
      <Route path="/domain/:id/user-stories" component={UserStories} />
      <Route path="/domain/:id/rag-context" component={RagContext} />
      
      {/* Existing routes remapped */}
      <Route path="/domain/:id/prompts" component={DomainPrompts} /> {/* 3. Prompt / Code */}
      <Route path="/domain/:id/training" component={DomainTraining} /> {/* 5. Sample Q&A */}
      
      {/* Evaluation Routes */}
      <Route path="/domain/:id/test-sets" component={TestSets} />
      <Route path="/domain/:id/metrics" component={MetricsDashboard} />

      {/* Keep schemas accessible but maybe not main nav anymore? Or under Context? 
          The prompt didn't explicitly delete schemas but implies a strict list. 
          I'll leave the route for now but it might be unlinked. */}
      <Route path="/domain/:id/schemas" component={DomainSchemas} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
