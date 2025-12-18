/**
 * Centralized API client for EvalsGenie
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Token management
 */
const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Health check endpoint
 */
export async function checkHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>('/healthz');
}

/**
 * API client object with all endpoints
 */
/**
 * Auth types
 */
export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Domain types
 */
export interface Domain {
  id: string;
  alias: string;
  description: string;
  dialect: string;
  secret: string;
  schema_name: string;
  retriever_top_k: number;
  is_active: boolean;
}

export interface DomainUpdate {
  alias?: string;
  description?: string;
  dialect?: string;
  secret?: string;
  schema_name?: string;
  retriever_top_k?: number;
  is_active?: boolean;
}

/**
 * Context Assets types
 */
export interface AgentIOSample {
  id: string;
  domain_id: string;
  input: string;
  output: string;
}

export interface AgentIOSampleCreate {
  input: string;
  output: string;
}

export interface UserStory {
  id: string;
  domain_id: string;
  story: string;
}

export interface UserStoryCreate {
  story: string;
}

export interface Prompt {
  id: string;
  domain_id: string;
  key: string;
  type: string;
  content: string;
}

export interface PromptCreate {
  key: string;
  type: string;
  content: string;
}

export interface PromptUpdate {
  key?: string;
  type?: string;
  content?: string;
}

export interface TrainingExample {
  id: string;
  domain_id: string;
  question: string;
  golden_answer: string;
  type?: string;
  tables?: string[];
}

export interface TrainingExampleCreate {
  question: string;
  golden_answer: string;
  type?: string;
  tables?: string[];
}

/**
 * RAG Document types
 */
export interface RagDocument {
  id: string;
  domain_id: string;
  filename: string;
  size: number;
  uploaded_at: string;
}

/**
 * Evaluation & Metrics types
 */
export interface TestSet {
  id: string;
  domain_id: string;
  question: string;
  ground_truth: string;
  difficulty: string;
  last_status?: string | null;
  confidence_score?: number | null;
}

export interface TestSetCreate {
  question: string;
  ground_truth: string;
  difficulty: string;
}

export interface MetricBreakdown {
  category: string;
  value: number;
}

export interface EvalMetrics {
  overall_score: number;
  hallucination_rate: number;
  avg_latency: number;
  pass_rate: number;
  metric_breakdown: MetricBreakdown[];
}

export interface EvalRunResponse {
  status: string;
  run_id: string;
  test_sets_evaluated: number;
}

/**
 * Dashboard types
 */
export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  pass_rate: number;
  pass_rate_trend: number;
  high_risk_agents: number;
  hallucination_rate: number;
  avg_latency: number;
}

export interface RecentEvaluation {
  id: string;
  name: string;
  category: string;
  date: string;
  score: number;
  status: string;
}

export interface HighRiskAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  pass_rate: number;
  evals: number;
  risk: string;
}

/**
 * API client object with all endpoints
 */
export const api = {
  // Health check
  health: {
    check: checkHealth,
  },

  // Authentication
  auth: {
    /**
     * Login with email and password
     */
    login: async (email: string, password: string): Promise<LoginResponse> => {
      const formData = new URLSearchParams();
      formData.append('username', email); // OAuth2 uses 'username' field
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || 'Login failed'
        );
      }

      return await response.json();
    },

    /**
     * Sign up with email and password
     */
    signup: async (email: string, password: string): Promise<User> => {
      return apiFetch<User>('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    /**
     * Get current user information
     */
    getMe: async (): Promise<User> => {
      return apiFetch<User>('/api/v1/auth/me');
    },

    /**
     * Logout (clear token)
     */
    logout: (): void => {
      removeToken();
    },
  },

  // Domain endpoints
  domains: {
    /**
     * List all domains
     */
    list: async (): Promise<Domain[]> => {
      return apiFetch<Domain[]>('/api/v1/domains');
    },

    /**
     * Get domain by ID
     */
    get: async (id: string): Promise<Domain> => {
      return apiFetch<Domain>(`/api/v1/domains/${id}`);
    },

    /**
     * Create a new domain
     */
    create: async (data: Domain): Promise<Domain> => {
      return apiFetch<Domain>('/api/v1/domains', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update domain by ID
     */
    update: async (id: string, data: DomainUpdate): Promise<Domain> => {
      return apiFetch<Domain>(`/api/v1/domains/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  },

  // Agent I/O endpoints
  agentIO: {
    /**
     * List all Agent I/O samples for a domain
     */
    list: async (domainId: string): Promise<AgentIOSample[]> => {
      return apiFetch<AgentIOSample[]>(`/api/v1/domains/${domainId}/agent-io`);
    },

    /**
     * Create a new Agent I/O sample
     */
    create: async (domainId: string, data: AgentIOSampleCreate): Promise<AgentIOSample> => {
      return apiFetch<AgentIOSample>(`/api/v1/domains/${domainId}/agent-io`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete an Agent I/O sample
     */
    delete: async (domainId: string, sampleId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/agent-io/${sampleId}`, {
        method: 'DELETE',
      });
    },
  },

  // User Stories endpoints
  userStories: {
    /**
     * List all user stories for a domain
     */
    list: async (domainId: string): Promise<UserStory[]> => {
      return apiFetch<UserStory[]>(`/api/v1/domains/${domainId}/user-stories`);
    },

    /**
     * Create a new user story
     */
    create: async (domainId: string, data: UserStoryCreate): Promise<UserStory> => {
      return apiFetch<UserStory>(`/api/v1/domains/${domainId}/user-stories`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete a user story
     */
    delete: async (domainId: string, storyId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/user-stories/${storyId}`, {
        method: 'DELETE',
      });
    },
  },

  // Prompts endpoints
  prompts: {
    /**
     * List all prompts for a domain
     */
    list: async (domainId: string): Promise<Prompt[]> => {
      return apiFetch<Prompt[]>(`/api/v1/domains/${domainId}/prompts`);
    },

    /**
     * Create a new prompt
     */
    create: async (domainId: string, data: PromptCreate): Promise<Prompt> => {
      return apiFetch<Prompt>(`/api/v1/domains/${domainId}/prompts`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update a prompt
     */
    update: async (domainId: string, promptId: string, data: PromptUpdate): Promise<Prompt> => {
      return apiFetch<Prompt>(`/api/v1/domains/${domainId}/prompts/${promptId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete a prompt
     */
    delete: async (domainId: string, promptId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/prompts/${promptId}`, {
        method: 'DELETE',
      });
    },
  },

  // Training Examples endpoints
  trainingExamples: {
    /**
     * List all training examples for a domain
     */
    list: async (domainId: string): Promise<TrainingExample[]> => {
      return apiFetch<TrainingExample[]>(`/api/v1/domains/${domainId}/training-examples`);
    },

    /**
     * Create a new training example
     */
    create: async (domainId: string, data: TrainingExampleCreate): Promise<TrainingExample> => {
      return apiFetch<TrainingExample>(`/api/v1/domains/${domainId}/training-examples`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete a training example
     */
    delete: async (domainId: string, exampleId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/training-examples/${exampleId}`, {
        method: 'DELETE',
      });
    },
  },

  // RAG Documents endpoints
  documents: {
    /**
     * List all documents for a domain
     */
    list: async (domainId: string): Promise<RagDocument[]> => {
      return apiFetch<RagDocument[]>(`/api/v1/domains/${domainId}/documents`);
    },

    /**
     * Upload a new document
     */
    upload: async (domainId: string, file: File): Promise<RagDocument> => {
      const formData = new FormData();
      formData.append('file', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/domains/${domainId}/documents`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || 'Upload failed'
        );
      }

      return await response.json();
    },

    /**
     * Delete a document
     */
    delete: async (domainId: string, docId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/documents/${docId}`, {
        method: 'DELETE',
      });
    },
  },

  // Test Sets endpoints
  testSets: {
    /**
     * List all test sets for a domain
     */
    list: async (domainId: string): Promise<TestSet[]> => {
      return apiFetch<TestSet[]>(`/api/v1/domains/${domainId}/test-sets`);
    },

    /**
     * Create a new test set
     */
    create: async (domainId: string, data: TestSetCreate): Promise<TestSet> => {
      return apiFetch<TestSet>(`/api/v1/domains/${domainId}/test-sets`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete a test set
     */
    delete: async (domainId: string, testSetId: string): Promise<{ message: string }> => {
      return apiFetch<{ message: string }>(`/api/v1/domains/${domainId}/test-sets/${testSetId}`, {
        method: 'DELETE',
      });
    },
  },

  // Evaluation endpoints
  evaluation: {
    /**
     * Run evaluation for a domain
     */
    run: async (domainId: string): Promise<EvalRunResponse> => {
      return apiFetch<EvalRunResponse>(`/api/v1/domains/${domainId}/run-eval`, {
        method: 'POST',
      });
    },

    /**
     * Get metrics for a domain
     */
    getMetrics: async (domainId: string): Promise<EvalMetrics> => {
      return apiFetch<EvalMetrics>(`/api/v1/domains/${domainId}/metrics`);
    },
  },

  // Dashboard endpoints
  dashboard: {
    /**
     * Get dashboard statistics
     */
    getStats: async (): Promise<DashboardStats> => {
      return apiFetch<DashboardStats>('/api/v1/dashboard/stats');
    },

    /**
     * Get recent evaluations
     */
    getRecentEvaluations: async (limit: number = 10): Promise<RecentEvaluation[]> => {
      return apiFetch<RecentEvaluation[]>(`/api/v1/dashboard/recent-evaluations?limit=${limit}`);
    },

    /**
     * Get high risk agents
     */
    getHighRiskAgents: async (): Promise<HighRiskAgent[]> => {
      return apiFetch<HighRiskAgent[]>('/api/v1/dashboard/high-risk-agents');
    },
  },

  // Schemas endpoints (to be implemented in future sprints)
  schemas: {
    // list: (domainId: string) => apiFetch(`/api/domains/${domainId}/schemas`),
    // get: (domainId: string, schemaId: string) => apiFetch(`/api/domains/${domainId}/schemas/${schemaId}`),
    // create: (domainId: string, data: any) => apiFetch(`/api/domains/${domainId}/schemas`, { method: 'POST', body: JSON.stringify(data) }),
    // update: (domainId: string, schemaId: string, data: any) => apiFetch(`/api/domains/${domainId}/schemas/${schemaId}`, { method: 'PUT', body: JSON.stringify(data) }),
    // delete: (domainId: string, schemaId: string) => apiFetch(`/api/domains/${domainId}/schemas/${schemaId}`, { method: 'DELETE' }),
  },
};

export default api;