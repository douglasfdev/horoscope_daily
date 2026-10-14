import { FastifyInstance, RouteOptions } from 'fastify';
import { GetDailyHoroscopeUseCase } from '../../application/use-cases/get-daily-horoscope.use-case.js';
import { GenerateAdvancedNatalChartUseCase } from '../../application/use-cases/generate-advanced-natal-chart.use-case.js';
import { Sign } from '../../domain/value-objects/Sign.js';

export async function routes(fastify: FastifyInstance, useCases: {
  getDailyHoroscopeUseCase: GetDailyHoroscopeUseCase;
  generateNatalChartUseCase: GenerateAdvancedNatalChartUseCase;
}) {
  const { getDailyHoroscopeUseCase, generateNatalChartUseCase } = useCases;

  fastify.get(
    '/v1/horoscope/daily',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            sign: { type: 'string' },
            lang: { type: 'string', default: 'pt' },
            date: { type: 'string', format: 'date' },
          },
          required: ['sign'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              sign: { type: 'string' },
              language: { type: 'string' },
              date: { type: 'string' },
              prediction: { type: 'string' },
              luckyNumber: { type: 'integer' },
              color: { type: 'string' },
              compatibility: { type: 'array', items: { type: 'string' } },
              generatedAt: { type: 'string', format: 'date-time' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        try {
          const { sign, lang, date } = request.query as { sign: string; lang?: string; date?: string };
          const normalizedSign = Sign.create(sign);
          const targetDate = date ? new Date(date) : undefined;
          const result = await getDailyHoroscopeUseCase.execute(
            normalizedSign.toString(),
            lang || 'pt',
            targetDate
          );
          return reply.code(200).send({
            sign: result.sign,
            language: result.language,
            date: result.date,
            prediction: result.prediction,
            luckyNumber: result.luckyNumber,
            color: result.color,
            compatibility: result.compatibility,
            generatedAt: result.generatedAt.toISOString(),
          });
        } catch (error: any) {
          fastify.log.error(error, 'Error fetching daily horoscope');
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: error.message,
          });
        }
      },
    }
  );

  fastify.post(
    '/v1/astro/natal-chart',
    {
      schema: {
        body: {
          type: 'object',
          required: ['birthDate', 'birthTime', 'latitude', 'longitude'],
          properties: {
            birthDate: { type: 'string', format: 'date' },
            birthTime: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string', default: 'America/Sao_Paulo' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              chartId: { type: 'string' },
              generatedAt: { type: 'string', format: 'date-time' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        try {
          const { birthDate, birthTime, latitude, longitude, timezone } = request.body as {
            birthDate: string;
            birthTime: string;
            latitude: number;
            longitude: number;
            timezone?: string;
          };
          const result = await generateNatalChartUseCase.execute(
            birthDate,
            birthTime,
            latitude,
            longitude,
            timezone || 'America/Sao_Paulo'
          );
          return reply.code(201).send({
            message: 'Mapa astral natal gerado com sucesso',
            chartId: `${result.generatedAt.getTime()}-${result.ascendant}`,
            generatedAt: result.generatedAt.toISOString(),
          });
        } catch (error: any) {
          fastify.log.error(error, 'Error generating natal chart');
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: error.message,
          });
        }
      },
    }
  );
}