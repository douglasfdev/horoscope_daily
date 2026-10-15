import { IWhatsappService } from '../../ports/whatsapp.service.port.js';
import whatsappConfig from '../../../domain/configuration/whatsapp.config.js';
import { diag } from '../../../config/opentelemetry.js';

interface SendMessageOptions {
  groupId?: string;
  type?: 'text' | 'html';
}

interface SendBatchOptions {
  type?: 'text' | 'html';
}

export class SendMessageUseCase {
  private whatsappService: IWhatsappService;

  constructor(whatsappService: IWhatsappService) {
    this.whatsappService = whatsappService;
  }

  async execute(message: string, options: SendMessageOptions = {}): Promise<boolean> {
    const { groupId, type } = options;
    const targetGroupId = groupId || whatsappConfig.defaultGroupId;

    try {
      diag.info('Enviando mensagem para grupo:', targetGroupId);

      await this.whatsappService.connect();

      const success = await this.whatsappService.sendToGroup(
        targetGroupId,
        message,
        type || 'text'
      );

      if (success) {
        diag.info('Mensagem enviada com sucesso');
        return true;
      } else {
        diag.error('Falha ao enviar mensagem');
        return false;
      }
    } catch (error) {
      diag.error('Erro ao enviar mensagem:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

export class SendBatchUseCase {
  private whatsappService: IWhatsappService;

  constructor(whatsappService: IWhatsappService) {
    this.whatsappService = whatsappService;
  }

  async execute(messages: Array<{ message: string; options?: SendMessageOptions }>, batchOptions?: SendBatchOptions): Promise<{
    success: number;
    failed: number;
    errors: Array<{ groupId: string; message: string; error: string }>;
  }> {
    try {
      diag.info('Iniciando envio em lote:', messages.length, 'mensagens');

      await this.whatsappService.connect();

      const processedMessages = messages.map(item => ({
        groupId: item.options?.groupId || whatsappConfig.defaultGroupId,
        message: item.message,
        type: item.options?.type || batchOptions?.type || 'text'
      }));

      const results = await this.whatsappService.sendBatch(processedMessages);

      diag.info('Lote completado - Sucesso:', results.success, 'Falhas:', results.failed);
      return results;
    } catch (error) {
      diag.error('Erro ao enviar lote:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
