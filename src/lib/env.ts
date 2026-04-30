const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]

function readEnvVar(name: RequiredEnvVar): string {
  const value = import.meta.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
}
