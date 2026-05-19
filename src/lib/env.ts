type RequiredEnvVar =
  | 'VITE_API_URL'
  | 'VITE_SUPABASE_ANON_KEY'
  | 'VITE_SUPABASE_URL';
type OptionalEnvVar =
  | 'VITE_SENTRY_DSN'
  | 'VITE_SENTRY_ENVIRONMENT'
  | 'VITE_SENTRY_RELEASE';

function readEnvVar(name: RequiredEnvVar): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readOptionalEnvVar(name: OptionalEnvVar): string | undefined {
  return import.meta.env[name];
}

export const env = {
  apiUrl: readEnvVar('VITE_API_URL'),
  sentryDsn: readOptionalEnvVar('VITE_SENTRY_DSN'),
  sentryEnvironment: readOptionalEnvVar('VITE_SENTRY_ENVIRONMENT'),
  sentryRelease: readOptionalEnvVar('VITE_SENTRY_RELEASE'),
  supabaseAnonKey: readEnvVar('VITE_SUPABASE_ANON_KEY'),
  supabaseUrl: readEnvVar('VITE_SUPABASE_URL'),
};
