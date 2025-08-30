/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useCallback } from "react"
import { api, ApiResponse, ApiError, handleApiError } from "./api"

// Hook state interface
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

// Hook return interface
interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<void>
  reset: () => void
}

// Hook for making API calls with loading and error states
export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  initialData: T | null = null
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await apiCall(...args)
        setState({
          data: response.data,
          loading: false,
          error: null,
        })
      } catch (error) {
        const apiError = handleApiError(error)
        setState({
          data: null,
          loading: false,
          error: apiError,
        })
      }
    },
    [apiCall]
  )

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
    })
  }, [initialData])

  return {
    ...state,
    execute,
    reset,
  }
}

// Specific hooks for common API operations
export function useProducts() {
  const getAllProducts = useCallback(() => api.get("/api/products"), [])
  const getProductBySlug = useCallback(
    (slug: string) => api.get(`/api/products/slug`, { slug }),
    []
  )
  const searchProducts = useCallback(
    (name?: string, category?: string) =>
      api.get("/api/products/search", { name, category }),
    []
  )

  return {
    getAll: () => useApi(getAllProducts),
    getBySlug: (slug: string) => useApi(() => getProductBySlug(slug)),
    search: (name?: string, category?: string) =>
      useApi(() => searchProducts(name, category)),
  }
}

export function useCategories() {
  const getAllCategories = useCallback(() => api.get("/api/categories"), [])
  const getCategoryBySlug = useCallback(
    (slug: string) => api.get(`/api/categories/${slug}`),
    []
  )

  return {
    getAll: () => useApi(getAllCategories),
    getBySlug: (slug: string) => useApi(() => getCategoryBySlug(slug)),
  }
}

export function useOrders() {
  const getAllOrders = useCallback(() => api.get("/api/orders"), [])
  const getOrderById = useCallback(
    (id: string) => api.get(`/api/orders/${id}`),
    []
  )
  const createOrder = useCallback(
    (orderData: any) => api.post("/api/orders", orderData),
    []
  )
  const updateOrder = useCallback(
    (id: string, orderData: any) => api.put(`/api/orders/${id}`, orderData),
    []
  )
  const deleteOrder = useCallback(
    (id: string) => api.delete(`/api/orders/${id}`),
    []
  )

  return {
    getAll: () => useApi(getAllOrders),
    getById: (id: string) => useApi(() => getOrderById(id)),
    create: () => useApi(createOrder),
    update: (id: string) =>
      useApi((orderData: any) => updateOrder(id, orderData)),
    delete: (id: string) => useApi(() => deleteOrder(id)),
  }
}

export function useAuth() {
  const login = useCallback(
    (credentials: { email: string; password: string }) =>
      api.post("/api/auth/login", credentials),
    []
  )
  const register = useCallback(
    (userData: any) => api.post("/api/auth/register", userData),
    []
  )
  const logout = useCallback(() => api.post("/api/auth/logout"), [])
  const refreshToken = useCallback(() => api.post("/api/auth/refresh"), [])

  return {
    login: () => useApi(login),
    register: () => useApi(register),
    logout: () => useApi(logout),
    refreshToken: () => useApi(refreshToken),
  }
}

// Hook for making custom API calls
export function useCustomApi<T = any>() {
  return {
    get: (
      endpoint: string,
      params?: Record<string, string | number | boolean>
    ) => useApi(() => api.get<T>(endpoint, params)),
    post: (endpoint: string) =>
      useApi((body?: any) => api.post<T>(endpoint, body)),
    put: (endpoint: string) =>
      useApi((body?: any) => api.put<T>(endpoint, body)),
    patch: (endpoint: string) =>
      useApi((body?: any) => api.patch<T>(endpoint, body)),
    delete: (endpoint: string) => useApi(() => api.delete<T>(endpoint)),
  }
}
