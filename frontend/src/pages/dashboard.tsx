import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.dashboard.getStats(),
  });

  // Fetch recent evaluations
  const { data: recentEvaluations, isLoading: isLoadingEvals } = useQuery({
    queryKey: ['recent-evaluations'],
    queryFn: () => api.dashboard.getRecentEvaluations(5),
  });

  // Fetch high risk agents
  const { data: highRiskAgents, isLoading: isLoadingRisk } = useQuery({
    queryKey: ['high-risk-agents'],
    queryFn: () => api.dashboard.getHighRiskAgents(),
  });

  const isLoading = isLoadingStats || isLoadingEvals || isLoadingRisk;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Spinner className="w-8 h-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of AI agent evaluation performance across your enterprise</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Agents */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Agents</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.total_agents || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Agents */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Active Agents</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.active_agents || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Pass Rate */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Evaluation Pass Rate</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.pass_rate || 0}%</p>
                  <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                    ↑ {stats?.pass_rate_trend || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* High Risk Agents */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">High Risk Agents</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.high_risk_agents || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Evaluations */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Recent Evaluations</CardTitle>
                <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {recentEvaluations && recentEvaluations.length > 0 ? (
                recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{evaluation.name}</h3>
                    <p className="text-sm text-gray-600">{evaluation.category}</p>
                    <p className="text-xs text-gray-500 mt-1">{evaluation.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{evaluation.score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <Badge
                      variant={evaluation.status === "Passed" ? "default" : "destructive"}
                      className={evaluation.status === "Passed" ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}
                    >
                      {evaluation.status}
                    </Badge>
                  </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent evaluations</p>
              )}
            </CardContent>
          </Card>

          {/* High Risk Agents */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">High Risk Agents</CardTitle>
                <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {highRiskAgents && highRiskAgents.length > 0 ? (
                highRiskAgents.map((agent) => (
                  <div key={agent.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {agent.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Pass Rate: {agent.passRate}% • Evals: {agent.evals}
                      </p>
                    </div>
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800 hover:bg-orange-100 ml-4">
                      {agent.risk}
                    </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No high risk agents</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}