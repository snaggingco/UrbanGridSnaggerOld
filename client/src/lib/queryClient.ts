import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Custom API Error type for better error handling
export class ApiError extends Error {
  status: number;
  statusText: string;
  
  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res.status, res.statusText, `${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    isFormData?: boolean;
  }
): Promise<T> {
  // Get auth token from localStorage
  const token = localStorage.getItem("auth_token");
  
  // Prepare headers
  const headers: Record<string, string> = {
    // Only set Content-Type to application/json if not FormData
    ...(options?.isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options?.headers || {})
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Determine if the body needs JSON.stringify
  // Only stringify if it's a regular object and not already a string or FormData
  const body = options?.body instanceof FormData || options?.isFormData || typeof options?.body === 'string'
    ? options?.body 
    : options?.body ? JSON.stringify(options.body) : undefined;
  
  const res = await fetch(url, {
    method: options?.method || 'GET',
    headers,
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from localStorage
    const token = localStorage.getItem("auth_token");
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
