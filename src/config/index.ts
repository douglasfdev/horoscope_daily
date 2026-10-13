export interface IConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  redisHost: string;
  redisPort: number;
  rabbitMqUrl: string;
  otelExporterEndpoint: string;
  serviceName: string;
}

export function loadConfig(): IConfig {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/daily-sorte-astro',
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
    rabbitMqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    otelExporterEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    serviceName: process.env.OTEL_SERVICE_NAME || 'daily-sorte-astroengine',
  };
}