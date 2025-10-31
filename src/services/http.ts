// src/services/http.ts
// Motor HTTP central (fetch + TS) para Vue 3 / Vite
// - Base URL desde VITE_API_BASE_URL (SIN fallback)
// - Manejo de JSON y FormData
// - Descargas (Blob) y errores tipados
// - Helpers: get/post/put/patch/del/upload/download

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  params?: Record<string, string | number | boolean | null | undefined>
  headers?: Record<string, string>
  responseType?: 'json' | 'blob' | 'text'
  rawResponse?: boolean
  withCredentials?: boolean
}

export interface ApiErrorPayload {
  message?: string
  code?: string | number
  errors?: unknown
}

export class ApiError extends Error {
  status: number
  code?: string | number
  details?: unknown
  url: string

  constructor(status: number, url: string, payload?: ApiErrorPayload) {
    super(payload?.message || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = payload?.code
    this.details = payload?.errors
    this.url = url
  }
}

/** ⚠️ Sin fallback: si falta la variable, fallamos en dev para que lo arregles. */
const BASE = import.meta.env.VITE_API_BASE_URL
if (!BASE) {
  // Mensaje claro para no quedarte pegado en móvil con "localhost"
  console.error('[CFG] Falta VITE_API_BASE_URL en el frontend (.env)')
  throw new Error('VITE_API_BASE_URL no definida')
}
const API_PREFIX = '/api'

function isFormData(x: unknown): x is FormData {
  return typeof FormData !== 'undefined' && x instanceof FormData
}

function buildQuery(params?: RequestOptions['params']): string {
  if (!params) return ''
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    q.append(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

function joinUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const left = String(BASE).replace(/\/+$/, '')
  const right = (API_PREFIX + '/' + String(path).replace(/^\/+/, '')).replace(/\/{2,}/g, '/')
  return `${left}${right}`
}

async function parseResponse(
  res: Response,
  responseType: RequestOptions['responseType']
): Promise<unknown> {
  if (res.status === 204) return null
  if (responseType === 'blob') return await res.blob()
  if (responseType === 'text') return await res.text()

  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) {
    return await res.json()
  }
  return await res.blob()
}

function toApiErrorPayload(payload: unknown): ApiErrorPayload | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined
  const maybe = payload as Record<string, unknown>
  const out: ApiErrorPayload = {}
  if (typeof maybe.message === 'string') out.message = maybe.message
  if (typeof maybe.code === 'string' || typeof maybe.code === 'number') out.code = maybe.code
  if ('errors' in maybe) out.errors = (maybe as any).errors
  return Object.keys(out).length ? out : undefined
}

/* ================== Core ================== */
export async function request<TResponse = unknown, TBody = unknown>(
  method: HttpMethod,
  path: string,
  data?: TBody,
  options: RequestOptions = {}
): Promise<TResponse> {
  const url = joinUrl(path) + buildQuery(options.params)
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers ?? {}),
  }

  let body: BodyInit | undefined
  if (data !== undefined && data !== null) {
    if (isFormData(data)) {
      body = data
    } else if (method !== 'GET') {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data as unknown)
    }
  }

  const credentials: RequestInit['credentials'] = options.withCredentials ? 'include' : 'omit'

  // LOG antes de disparar
  console.log('[HTTP] →', { method, url })

  const res = await fetch(url, { method, headers, body, credentials })

  if (options.rawResponse) return (res as unknown) as TResponse

  const payload = await parseResponse(res, options.responseType ?? 'json')

  // LOG después de recibir
  console.log('[HTTP] ←', { status: res.status, url })

  if (!res.ok) {
    if (payload instanceof Blob) throw new ApiError(res.status, url, { message: `HTTP ${res.status}` })
    throw new ApiError(res.status, url, toApiErrorPayload(payload))
  }

  return payload as TResponse
}

/* ================== Helpers ================== */
export const get = <T = unknown>(path: string, opts?: RequestOptions) =>
  request<T>('GET', path, undefined, opts)

export const post = <T = unknown, B = unknown>(path: string, data?: B, opts?: RequestOptions) =>
  request<T, B>('POST', path, data, opts)

export const put = <T = unknown, B = unknown>(path: string, data?: B, opts?: RequestOptions) =>
  request<T, B>('PUT', path, data, opts)

export const patch = <T = unknown, B = unknown>(path: string, data?: B, opts?: RequestOptions) =>
  request<T, B>('PATCH', path, data, opts)

export const del = <T = unknown>(path: string, opts?: RequestOptions) =>
  request<T>('DELETE', path, undefined, opts)

/** Subir archivos */
export function upload<T = unknown>(path: string, formData: FormData, opts?: RequestOptions) {
  return request<T, FormData>('POST', path, formData, { ...(opts ?? {}), responseType: 'json' })
}

/** Descargar archivo (Blob + nombre si existe) */
export async function download(
  path: string,
  opts?: RequestOptions
): Promise<{ blob: Blob; filename?: string }> {
  const res = await request<Response>('GET', path, undefined, {
    ...(opts ?? {}),
    responseType: 'blob',
    rawResponse: true,
  })
  const blob = await res.blob()
  const cd = res.headers.get('content-disposition') ?? ''
  const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/)
  const filename = match ? decodeURIComponent(match[1]) : undefined
  return { blob, filename }
}
