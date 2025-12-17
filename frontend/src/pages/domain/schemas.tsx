import { Layout } from "@/components/layout/layout";
import { SCHEMAS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RefreshCcw, Trash2, Plus } from "lucide-react";
import { useState } from "react";

export default function DomainSchemas() {
  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schemas description</h1>
            <p className="text-muted-foreground">Manage domain's schema</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add schema
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Save changes</Button>
          </div>
        </div>

        <div className="space-y-4">
          {SCHEMAS.map((schema, index) => (
            <SchemaItem key={schema.id} schema={schema} defaultOpen={index === 0} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function SchemaItem({ schema, defaultOpen }: { schema: any, defaultOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-t-lg">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto font-semibold text-base text-foreground">
             {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
             {schema.id}
             <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-300">{schema.columnCount}</Badge>
          </Button>
        </CollapsibleTrigger>
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCcw className="w-4 h-4 text-muted-foreground" /></Button>
           <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="p-6 border-t space-y-6">
           <p className="text-sm text-muted-foreground leading-relaxed">
             {schema.description}
           </p>

           {schema.columns.length > 0 && (
             <div className="border rounded-md overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-muted-foreground font-medium border-b">
                   <tr>
                     <th className="px-4 py-3 w-12"></th>
                     <th className="px-4 py-3">Name</th>
                     <th className="px-4 py-3">Type</th>
                     <th className="px-4 py-3">Usage</th>
                     <th className="px-4 py-3">Comment</th>
                     <th className="px-4 py-3">Examples</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y">
                   {schema.columns.map((col: any, i: number) => (
                     <tr key={i} className="hover:bg-slate-50/50">
                       <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                       <td className="px-4 py-3 font-medium">{col.name}</td>
                       <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{col.type}</td>
                       <td className="px-4 py-3 text-muted-foreground">{col.usage}</td>
                       <td className="px-4 py-3 text-muted-foreground">{col.comment}</td>
                       <td className="px-4 py-3 text-muted-foreground italic">{col.examples}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
