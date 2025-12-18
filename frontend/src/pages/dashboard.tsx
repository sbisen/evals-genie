import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle, TrendingUp, AlertTriangle, ArrowRight, Target, Clock, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

  // Mock data for agent performance over months
  const agentPerformanceData = [
    { month: 'Jan', 'Finance Agent': 92, 'DevOps Agent': 88, 'Ads Agent': 85, 'Engineering Agent': 90 },
    { month: 'Feb', 'Finance Agent': 94, 'DevOps Agent': 87, 'Ads Agent': 88, 'Engineering Agent': 91 },
    { month: 'Mar', 'Finance Agent': 93, 'DevOps Agent': 90, 'Ads Agent': 86, 'Engineering Agent': 93 },
    { month: 'Apr', 'Finance Agent': 95, 'DevOps Agent': 89, 'Ads Agent': 90, 'Engineering Agent': 94 },
    { month: 'May', 'Finance Agent': 96, 'DevOps Agent': 92, 'Ads Agent': 89, 'Engineering Agent': 95 },
    { month: 'Jun', 'Finance Agent': 97, 'DevOps Agent': 91, 'Ads Agent': 92, 'Engineering Agent': 96 },
  ];

  // Mock data for weekly active users
  const weeklyActiveUsersData = [
    { week: 'Week 1', 'Finance Agent': 1250, 'DevOps Agent': 980, 'Ads Agent': 1450, 'Engineering Agent': 1120 },
    { week: 'Week 2', 'Finance Agent': 1380, 'DevOps Agent': 1050, 'Ads Agent': 1520, 'Engineering Agent': 1200 },
    { week: 'Week 3', 'Finance Agent': 1420, 'DevOps Agent': 1100, 'Ads Agent': 1580, 'Engineering Agent': 1280 },
    { week: 'Week 4', 'Finance Agent': 1550, 'DevOps Agent': 1180, 'Ads Agent': 1650, 'Engineering Agent': 1350 },
  ];

  const isLoading = isLoadingStats || isLoadingEvals;

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Eval Metrics Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of AI agent evaluation performance across your enterprise</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Accuracy Rate (renamed from Evaluation Pass Rate) */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Accuracy Rate</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.pass_rate || 0}%</p>
                  <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                    ↑ {stats?.pass_rate_trend || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hallucination Rate */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Hallucination</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.hallucination_rate || 0}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Latency */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Latency</p>
                  <p className="text-4xl font-bold text-gray-900">{stats?.avg_latency || 0}s</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-indigo-600" />
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
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Feedback Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Thumbs Up vs Down */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold">User Feedback</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Overall user satisfaction across all agents</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <ThumbsUp className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-4xl font-bold text-green-600 mb-2">8,547</p>
                  <p className="text-sm text-gray-600 font-medium">Positive Feedback</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <ThumbsDown className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-4xl font-bold text-red-600 mb-2">1,243</p>
                  <p className="text-sm text-gray-600 font-medium">Negative Feedback</p>
                  <p className="text-xs text-red-600 mt-1">↓ 8% from last month</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Satisfaction Rate</span>
                  <span className="text-lg font-bold text-gray-900">87.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-600 h-3 rounded-full" style={{ width: '87.3%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Active Users */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-bold">Weekly Active Users</CardTitle>
              <p className="text-sm text-gray-600 mt-1">User engagement across different agents over the last 4 weeks</p>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyActiveUsersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="week"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Active Users', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="Finance Agent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="DevOps Agent" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Ads Agent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Engineering Agent" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                      variant={evaluation.status === "Passed" ? "default" : evaluation.status === "Partial" ? "secondary" : "destructive"}
                      className={
                        evaluation.status === "Passed"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : evaluation.status === "Partial"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
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

          {/* Agent Performance Over Time */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Agent Performance Trends</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Pass rate performance across different agents over the last 6 months</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={agentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    domain={[80, 100]}
                    label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#6b7280' } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                  <Line
                    type="monotone"
                    dataKey="Finance Agent"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="DevOps Agent"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Ads Agent"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Engineering Agent"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}