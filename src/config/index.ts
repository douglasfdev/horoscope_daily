import "dotenv/config"

export interface IConfig {
  nodeEnv: string;
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  redisUri: string;
  redisPassword: string;
  rabbitMqUrl: string;
  otelExporterEndpoint: string;
  serviceName: string;
  keycloakIssuer: string;
  keycloakClientId: string;
  keycloakClientSecret: string;
  upstashRestUrl: string;
  upstashRestToken: string;
}

const {
  NODE_ENV,
  PORT,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_ANON_KEY: SUPABASE_SECRET_KEY,
  REDIS_URI,
  REDIS_PASSWORD,
  RABBITMQ_URL,
  OTEL_EXPORTER_OTLP_ENDPOINT,
  OTEL_SERVICE_NAME,
  KEYCLOAK_ISSUER,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN
} = process.env;

export function loadConfig(): IConfig {
  return {
    nodeEnv: NODE_ENV || 'development',
    port: parseInt(PORT || '3000', 10),
    supabaseUrl: SUPABASE_URL || 'https://x.supabase.co',
    supabaseAnonKey: SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_x',
    redisUri: REDIS_URI || 'https://valid-moose-232668.upstash.io',
    redisPassword: REDIS_PASSWORD || '',
    rabbitMqUrl: RABBITMQ_URL || 'amqp://localhost:5672',
    otelExporterEndpoint: OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    serviceName: OTEL_SERVICE_NAME || 'daily-sorte-astroengine',
    keycloakIssuer: KEYCLOAK_ISSUER || 'https://x.supabase.co/auth',
    keycloakClientId: KEYCLOAK_CLIENT_ID || 'frontend',
    keycloakClientSecret: KEYCLOAK_CLIENT_SECRET || 'sb_secret_US_x-',
    upstashRestUrl: UPSTASH_REDIS_REST_URL || 'https://valid-moose-232668.upstash.io',
    upstashRestToken: UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAA4zcAAIgcDIxMDdjZjBmNmEzNTk0MTEyOWE5NmFjNjVjYjY2NTdlZg',
  };
}