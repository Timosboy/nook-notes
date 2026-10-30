import { endSession, getToken } from './session'

export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await send(path, options)

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function send(path: string, options: RequestInit): Promise<Response> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (options.body && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Cannot reach the server', 0)
  }

  if (response.status === 401 && token && token === getToken()) endSession('expired')
  return response
}

export async function authorizedFetch(url: string): Promise<Response> {
  const token = getToken()
  const response = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
  if (response.status === 401 && token && token === getToken()) endSession('expired')
  return response
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const { message } = (await response.json()) as { message?: string | string[] }
    return Array.isArray(message) ? message.join(', ') : (message ?? 'Something went wrong')
  } catch {
    return 'Something went wrong'
  }
}
