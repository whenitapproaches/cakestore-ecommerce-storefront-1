import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Default headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

// API response types
export interface ApiResponse<T = any> {
  data: T
  status: number
  ok: boolean
}

export interface ApiError {
  message: string
  status: number
  error?: any
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

// Request options interface
export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
}

// Main API client class
class ApiClient {
  private axiosInstance: AxiosInstance

  constructor(baseURL: string = API_BASE_URL, defaultHeaders: Record<string, string> = DEFAULT_HEADERS) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: defaultHeaders,
      timeout: 10000,
    })

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Remove Content-Type header for GET requests or when body is FormData
        if (config.method === 'get' || config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        // Handle axios errors
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout')
        }
        
        if (error.response) {
          // Server responded with error status
          const errorData = error.response.data
          throw new Error(errorData?.message || `HTTP error! status: ${error.response.status}`)
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('No response received from server')
        } else {
          // Something else happened
          throw new Error(error.message || 'An unexpected error occurred')
        }
      }
    )
  }

  // Helper method to handle response
  private handleResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      ok: response.status >= 200 && response.status < 300,
    }
  }

  // Main request method
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout,
    } = options

    const config: AxiosRequestConfig = {
      method: method.toLowerCase(),
      url: endpoint,
      headers,
      timeout,
    }

    // Handle parameters
    if (params) {
      config.params = params
    }

    // Handle request body
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        config.data = body
      } else {
        config.data = body
      }
    }

    try {
      const response = await this.axiosInstance.request<T>(config)
      return this.handleResponse<T>(response)
    } catch (error) {
      // Error is already handled by the interceptor, but we can add additional handling here if needed
      throw error
    }
  }

  // Convenience methods for common HTTP methods
  async get<T = any>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Method to update base URL
  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL
  }

  // Method to update default headers
  setDefaultHeaders(headers: Record<string, string>): void {
    this.axiosInstance.defaults.headers.common = {
      ...this.axiosInstance.defaults.headers.common,
      ...headers,
    }
  }

  // Method to get the underlying axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Create and export default API client instance
export const api = new ApiClient()

// Export the class for custom instances
export { ApiClient }

// Type-safe API helpers for specific endpoints
export const productsApi = {
  // Get all products with filters, sorting, and pagination
  getAll: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    view?: string;
    filters?: {
      brand?: string[];
      color?: string[];
      sales?: string[];
      price?: number[];
      rating?: number;
    };
    search?: string;
  }) => {
    // Convert complex params to URL query string format
    const queryParams: Record<string, string | number | boolean> = {};
    
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.view) queryParams.view = params.view;
    if (params?.search) queryParams.search = params.search;
    
    // Handle filters
    if (params?.filters) {
      if (params.filters.brand?.length) queryParams.brand = params.filters.brand.join(',');
      if (params.filters.color?.length) queryParams.color = params.filters.color.join(',');
      if (params.filters.sales?.length) queryParams.sales = params.filters.sales.join(',');
      if (params.filters.price?.length) queryParams.price = params.filters.price.join(',');
      if (params.filters.rating) queryParams.rating = params.filters.rating;
    }
    
    return api.get('/api/products', queryParams);
  },
  
  // Get product by slug
  getBySlug: (slug: string) => api.get(`/api/products/${slug}`),
  
  // Search products
  search: (name?: string, category?: string) => 
    api.get('/api/products/search', { name, category }),
  
  // Get product slugs
  getSlugs: () => api.get('/api/products/slug-list'),
}

export const categoriesApi = {
  // Get all categories
  getAll: () => api.get('/api/categories'),
  
  // Get category by slug
  getBySlug: (slug: string) => api.get(`/api/categories/${slug}`),
}

export const ordersApi = {
  // Get all orders
  getAll: () => api.get('/api/orders'),
  
  // Get order by ID
  getById: (id: string) => api.get(`/api/orders/${id}`),
  
  // Create new order
  create: (orderData: any) => api.post('/api/orders', orderData),
  
  // Update order
  update: (id: string, orderData: any) => api.put(`/api/orders/${id}`, orderData),
  
  // Delete order
  delete: (id: string) => api.delete(`/api/orders/${id}`),
}

// Shipping-related endpoints under orders
export const shippingApi = {
  // Get eligible shipping methods for the active order
  getEligibleMethods: () =>
    api.get<{ methods: Array<{ id: string; name: string; description?: string | null; price: number }> }>(
      '/api/orders/shipping'
    ),

  // Apply shipping method(s) to the active order
  setShippingMethod: (ids: string[] | string) => {
    const shippingMethodIds = Array.isArray(ids) ? ids : [ids]
    return api.post<{ success: boolean; order: any }>(
      '/api/orders/shipping',
      { shippingMethodIds }
    )
  },
}

// Coupon endpoints
export const couponApi = {
  apply: (code: string) => api.post<{ success: boolean; order: any }>(
    '/api/orders/coupon',
    { code }
  ),
  remove: (code: string) => api.delete<{ success: boolean; order: any }>(
    `/api/orders/coupon?code=${encodeURIComponent(code)}`
  ),
}

export const storeSettingsApi = {
  // Get store settings by keys (comma or pipe-separated)
  getByKeys: (keys: string | string[]) => {
    const keysParam = Array.isArray(keys) ? keys.join("|") : keys
    return api.get('/api/store-settings', { keys: keysParam })
  },
}

// Cart endpoint
export const cartApi = {
  getActive: () => api.get('/api/cart'),
}

// Order detail fetcher for SSR/Server Components
export interface OrderDetailResponse {
  order: any
  qrImageUrl: string | null
  qrImageUrl2: string | null
}

export const fetchOrder = async (
  code: string,
  opts?: { baseURL?: string; cookie?: string; headers?: Record<string, string>; token?: string }
): Promise<OrderDetailResponse> => {
  const base = opts?.baseURL || API_BASE_URL
  const hdrs: Record<string, string> = {
    ...(opts?.headers || {}),
    ...(opts?.cookie ? { cookie: opts.cookie } : {}),
  }

  const url = new URL(`${base}/api/orders/${encodeURIComponent(code)}`)
  if (opts?.token) url.searchParams.set('token', opts.token)

  const res = await fetch(url.toString(), {
    headers: hdrs,
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch order: ${res.status}`)
  }
  return (await res.json()) as OrderDetailResponse
}

export const authApi = {
  // Login
  login: (credentials: { email: string; password: string }) => 
    api.post('/api/auth/login', credentials),
  
  // Register
  register: (userData: any) => api.post('/api/auth/register', userData),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
  
  // Refresh token
  refreshToken: () => api.post('/api/auth/refresh'),
}

// Utility function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
      error,
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    status: 500,
    error,
  }
}

// Hook for making API calls with loading and error states
export const useApi = () => {
  return {
    api,
    productsApi,
    categoriesApi,
    ordersApi,
    authApi,
    handleApiError,
  }
}
