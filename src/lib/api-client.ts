import { supabase } from './supabase'
import { env } from './env'

type ApiErrorBody = {
  message?: string | string[]
}

export async function apiRequest<TData>(
  path: string,
  options: RequestInit = {},
) {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()

  if (sessionError) {
    return { data: null, error: sessionError }
  }

  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    return { data: null, error: new Error('You must be signed in.') }
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    return { data: null, error: new Error(await readErrorMessage(response)) }
  }

  return { data: (await response.json()) as TData, error: null }
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody
    const message = body.message

    if (Array.isArray(message)) {
      return message.join(' ')
    }

    return message ?? 'Request failed.'
  } catch {
    return 'Request failed.'
  }
}
