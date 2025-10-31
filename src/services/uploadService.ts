import { upload } from './http'

export interface UploadImageResponse {
  url: string
  filename?: string
  mime?: string
  size?: number
  hash?: string | null
  id?: string | number | null
}

/** Subir imagen a /api/v1/uploads/images (campo "file") */
export async function uploadImage(
  file: File,
  extra?: Record<string, string | number | boolean>
): Promise<UploadImageResponse> {
  const form = new FormData()
  form.append('file', file)
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => form.append(k, String(v)))
  }
  return upload<UploadImageResponse>('/v1/uploads/images', form)
}

/** Subida genérica a /api/v1/upload (campo "file") */
export async function uploadFileGeneric(
  file: File,
  path: string = '/v1/upload',
  fieldName: string = 'file'
): Promise<Record<string, unknown>> {
  const form = new FormData()
  form.append(fieldName, file)
  return upload<Record<string, unknown>>(path, form)
}
