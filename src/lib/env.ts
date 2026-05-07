type RequiredEnvVar =
  | 'VITE_API_URL'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'VITE_SUPABASE_URL';

function readEnvVar(name: RequiredEnvVar): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  apiUrl: readEnvVar('VITE_API_URL'),
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
};
