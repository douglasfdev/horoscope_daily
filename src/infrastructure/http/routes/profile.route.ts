import { FastifyInstance, RouteOptions } from 'fastify';
import { getProfileUseCase, saveProfileUseCase } from '../../../application/use-cases/save-profile.use-case.js';
import { IProfile } from '../../../infrastructure/database/models/profile.model.js';

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.get<
    {
      Params: { userId: string };
      Reply: { 200: IProfile; 404: { error: string }; 500: { error: string; message: string } };
    }
  >(
    '/v1/profile/:userId',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
          },
          required: ['userId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              phone: { type: 'string' },
              preferredLanguage: { type: 'string' },
              notificationOptIn: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        try {
          const { userId } = request.params;
          const profile = await getProfileUseCase(userId);

          if (!profile) {
            return reply.code(404).send({ error: 'Profile not found' });
          }

          return reply.code(200).send({
            userId: profile.userId,
            phone: profile.phone,
            preferredLanguage: profile.preferredLanguage,
            notificationOptIn: profile.notificationOptIn,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          });
        } catch (error: any) {
          fastify.log.error(error, 'Error fetching profile');
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: error.message,
          });
        }
      },
    }
  );

  fastify.post<
    {
      Body: Partial<IProfile>;
      Params: { userId: string };
      Reply: {
        200: IProfile;
        400: { error: string };
        401: { error: string };
        500: { error: string; message: string };
      };
    }
  >(
    '/v1/profile/:userId',
    {
      preHandler: async (request, reply) => {
        // Extract userId from authenticated JWT (Keycloak sub claim)
        const authHeader = request.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          return reply.code(401).send({ error: 'Unauthorized - missing token' });
        }
        // The userId from the route param should match the authenticated user
        // In a full Keycloak integration, this would verify the JWT
      },
      schema: {
        params: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
          },
          required: ['userId'],
        },
        body: {
          type: 'object',
          required: ['userId'],
          properties: {
            userId: { type: 'string' },
            phone: { type: 'string' },
            preferredLanguage: { type: 'string' },
            notificationOptIn: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              phone: { type: 'string' },
              preferredLanguage: { type: 'string' },
              notificationOptIn: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          401: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
      handler: async (request, reply) => {
        try {
          const { userId } = request.params;
          const body = request.body as Partial<IProfile>;

          // Ensure userId from body matches route param
          if (body.userId !== userId) {
            return reply.code(400).send({ error: 'User ID mismatch' });
          }

          const profile = await saveProfileUseCase({
            userId: body.userId,
            phone: body.phone!,
            preferredLanguage: body.preferredLanguage!,
            notificationOptIn: body.notificationOptIn!,
            createdAt: new Date(), // This will be set by the database on insert
            updatedAt: new Date(), // This will be set by the database on insert
          });

          return reply.code(200).send({
            userId: profile.userId,
            phone: profile.phone,
            preferredLanguage: profile.preferredLanguage,
            notificationOptIn: profile.notificationOptIn,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          });
        } catch (error: any) {
          fastify.log.error(error, 'Error saving profile');
          return reply.code(500).send({
            error: 'Internal Server Error',
            message: error.message,
          });
        }
      },
    }
  );
}