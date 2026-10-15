import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SendMessageUseCase, SendBatchUseCase } from '../../application/use-cases/whatsapp';
import WhatsappService from '../../infrastructure/adapters/whatsapp/whatsapp.service.impl';

// Interface de sucesso
export interface WhatsappMessageResponse {
  success: boolean;
  groupId?: string;
  message?: string;
  error?: string;
}

// Interface de batch response
export interface WhatsappBatchResponse {
  success: number;
  failed: number;
  errors: WhatsappMessageResponse[];
  timestamp: number;
}

let whatsappService: WhatsappService | null = null;

export function initializeWhatsappService() {
  if (!whatsappService) {
    whatsappService = new WhatsappService({ autoConnect: false });
  }
  return whatsappService;
}

export async function registerWhatsappRoutes(app: FastifyInstance) {
  app.log.info('Registrando rotas WhatsApp');
  
  // Initialize service
  initializeWhatsappService();
  
  app.log.info('Service instanciada');
}

export async function whatsappSendMessage(
  request: FastifyRequest<{ Body: { message: string; options?: any } }>,
  reply: FastifyReply
) {
  try {
    const { message, options } = request.body;
    
    if (!message) {
      return reply.status(400).send({
        success: false,
        error: 'Campo message é obrigatório'
      });
    }

    app.log.info(\Recebendo mensagem WhatsApp: \);
    
    const sendMessageUseCase = new SendMessageUseCase(whatsappService!);
    
    const result = await sendMessageUseCase.execute(message, options);
    
    return reply.status(result ? 200 : 500).send({
      success: result,
      groupId: options?.groupId,
      sendingMessage: message
    });
  } catch (error) {
    app.log.error('Erro ao enviar mensagem WhatsApp:', error);
    
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function whatsappSendBatch(
  request: FastifyRequest<{ Body: { messages: Array<{ message: string; options?: any }>, batchOptions?: any } }>,
  reply: FastifyReply
) {
  try {
    const { messages, batchOptions } = request.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return reply.status(400).send({
        success: false,
        error: 'Campo messages é obrigatório e deve ser um array'
      });
    }

    app.log.info(\Recebendo batch WhatsApp: \ mensagens\);
    
    const sendBatchUseCase = new SendBatchUseCase(whatsappService!);
    
    const result = await sendBatchUseCase.execute(messages, batchOptions);
    
    return reply.status(200).send({
      success: result.success,
      failed: result.failed,
      errors: result.errors
    });
  } catch (error) {
    app.log.error('Erro ao enviar batch WhatsApp:', error);
    
    return reply.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
