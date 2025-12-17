import { Link } from "wouter";
import { ArrowRight, CheckCircle2, BarChart3, Database, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@assets/generated_images/minimalist_abstract_geometric_logo_for_ai_evaluation_platform.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b py-4 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center overflow-hidden">
               <img src={logo} alt="Logo" className="w-full h-full object-cover" />
           </div>
           <div className="font-bold text-xl tracking-tight">DomainEval</div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login"><a className="text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</a></Link>
          <Link href="/domain/maps">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-6 max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            New: Automated Test Set Generation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
            Validate AI Agents <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              with Domain Awareness
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A no-code platform that empowers enterprise teams to generate evaluation sets, 
            metrics, and decision boards tailored to your specific domain context.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/domain/maps">
              <Button size="lg" className="h-12 px-8 text-base rounded-full">
                Start Evaluating
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full">
              View Documentation
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Database className="w-6 h-6 text-indigo-600" />}
                title="Domain-Aware"
                description="Upload schemas and user stories to generate targeted evaluation question sets automatically."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-indigo-600" />}
                title="Decision Dashboard"
                description="Get auto-suggested metrics tailored to your domain like hallucination rate and latency."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-indigo-600" />}
                title="No-Code UI"
                description="Empower non-technical stakeholders to run evaluations with a simple drag-and-drop interface."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        © 2025 EvalsGenie. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
