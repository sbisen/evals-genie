import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MetricsDashboard() {
  const [, params] = useRoute("/domain/:id/metrics");
  const domainId = params?.id || "";

  // Fetch metrics data
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["metrics", domainId],
    queryFn: () => api.evaluation.getMetrics(domainId),
    enabled: !!domainId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Transform metric breakdown for chart
  const chartData = metrics?.metric_breakdown.map(item => ({
    name: item.category,
    score: item.value,
  })) || [];

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Readiness Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into your agent's performance.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading metrics...</div>
        ) : !metrics ? (
          <div className="text-center py-8 text-muted-foreground">
            No metrics available. Run an evaluation first.
          </div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard 
                title="Overall Score" 
                value={`${metrics.overall_score.toFixed(1)}/100`}
                icon={<BarChart3 className="w-4 h-4 text-indigo-600" />} 
                trend={metrics.overall_score >= 90 ? "Excellent" : metrics.overall_score >= 70 ? "Good" : "Needs Improvement"}
                good={metrics.overall_score >= 70}
              />
              <KpiCard 
                title="Hallucination Rate" 
                value={`${metrics.hallucination_rate.toFixed(1)}%`}
                icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} 
                trend={metrics.hallucination_rate <= 5 ? "Low" : "High"}
                good={metrics.hallucination_rate <= 5}
              />
              <KpiCard 
                title="Avg Latency" 
                value={`${metrics.avg_latency.toFixed(0)}ms`}
                icon={<Zap className="w-4 h-4 text-indigo-600" />} 
                trend={metrics.avg_latency <= 500 ? "Fast" : "Slow"}
                good={metrics.avg_latency <= 500}
              />
              <KpiCard 
                title="Pass Rate" 
                value={`${metrics.pass_rate.toFixed(1)}%`}
                icon={<CheckCircle className="w-4 h-4 text-emerald-600" />} 
                trend={metrics.pass_rate >= 90 ? "Excellent" : metrics.pass_rate >= 70 ? "Good" : "Needs Work"}
                good={metrics.pass_rate >= 70}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Chart */}
              <Card className="col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Pass Rate by Difficulty</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{fill: 'transparent'}}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value: any) => [`${value.toFixed(1)}%`, 'Pass Rate']}
                        />
                        <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-sm bg-indigo-50/50 border-indigo-100">
                <CardHeader>
                  <CardTitle className="text-indigo-900">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metrics.avg_latency > 500 && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <div className="text-xs font-semibold text-indigo-600 uppercase mb-1">Latency</div>
                      <p className="text-sm text-slate-700">
                        Consider caching SQL schema lookups to reduce latency. Current: {metrics.avg_latency.toFixed(0)}ms
                      </p>
                    </div>
                  )}
                  {metrics.hallucination_rate > 5 && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <div className="text-xs font-semibold text-amber-600 uppercase mb-1">Hallucination</div>
                      <p className="text-sm text-slate-700">
                        Hallucination rate is {metrics.hallucination_rate.toFixed(1)}%. Review failed test cases and improve prompt context.
                      </p>
                    </div>
                  )}
                  {metrics.pass_rate < 90 && (
                    <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <div className="text-xs font-semibold text-rose-600 uppercase mb-1">Pass Rate</div>
                      <p className="text-sm text-slate-700">
                        Pass rate is {metrics.pass_rate.toFixed(1)}%. Review failing test sets and adjust training examples.
                      </p>
                    </div>
                  )}
                  {metrics.overall_score >= 90 && metrics.pass_rate >= 90 && metrics.hallucination_rate <= 5 && metrics.avg_latency <= 500 && (
                    <div className="p-3 bg-white rounded-lg border border-emerald-100 shadow-sm">
                      <div className="text-xs font-semibold text-emerald-600 uppercase mb-1">Excellent Performance</div>
                      <p className="text-sm text-slate-700">
                        Your agent is performing well across all metrics. Keep monitoring for consistency.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  good?: boolean;
}

function KpiCard({ title, value, icon, trend, good = true }: KpiCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${good ? 'text-emerald-600' : 'text-rose-600'} flex items-center mt-1`}>
          {trend}
        </p>
      </CardContent>
    </Card>
  );
}
