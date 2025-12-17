import { Layout } from "@/components/layout/layout";
import { OWNERS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DomainOwners() {
  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Owners</h1>
            <p className="text-muted-foreground">Who can configure this domain?</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Type a username..." className="pl-9" />
            </div>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4" />
              Add new
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[400px]">User</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {OWNERS.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell className="font-medium">{owner.username}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive">
                      Revoke access
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-slate-50/30">
             <div className="flex items-center gap-2">
               <Select defaultValue="10">
                 <SelectTrigger className="w-16 h-8">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div>1 of 1 pages</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
