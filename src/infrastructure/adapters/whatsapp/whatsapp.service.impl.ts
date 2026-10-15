import { IWhatsappService, IWhatsappClient } from '../../../application/ports/whatsapp.service.port';
import { WhatsappClient } from './repositories/whatsapp-client.impl';
import whatsappConfig from '../../../domain/configuration/whatsapp.config';
import { diag } from '../../../config/opentelemetry';

interface WhatsappServiceConfig {
  autoConnect?: boolean;
  clientConfig?: any;
}

export class WhatsappService implements IWhatsappService {
  private client: IWhatsappClient;
  private autoConnect: boolean;

  constructor(config: WhatsappServiceConfig = {}) {
    this.client = new WhatsappClient(config.clientConfig || {});
    this.autoConnect = config.autoConnect ?? true;
  }

  async connect(): Promise<void> {
    try {
      if (this.autoConnect) {
        await this.client.connect();
      } else {
        diag.info('Aguardando conexão automática...');
      }
    } catch (error) {
      diag.error('Erro ao conectar:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      diag.info('Desconectado do WhatsApp');
    } catch (error) {
      diag.error('Erro ao desconectar:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  async sendToGroup(groupId: string, message: string, type: 'text' | 'html' = 'text'): Promise<boolean> {
    try {
      diag.info('Preparando envio de mensagem para:', groupId);
      
      if (this.autoConnect && !this.client.isConnected()) {
        await this.connect();
      }
      
      // Processa mensagem baseado no tipo
      let processedMessage = message;
      let jid = this.client.formatJid(groupId);
      
      // Se o grupo já tem o formato correto, usa diretamente
      if (groupId.includes('@g.us')) {
        jid = groupId;
        if (type === 'html') {
          processedMessage = {
            text: message,
            extendedTextMessage: { text: message }
          };
        }
      }

      await this.client.sendMessage(jid, processedMessage);
      diag.info('Mensagem enviada com sucesso!');
      return true;
    } catch (error) {
      diag.error('Erro ao enviar mensagem para grupo:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async sendBatch(messages: Array<{ groupId: string; message: string; type?: 'text' | 'html' }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ groupId: string; message: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ groupId: string; message: string; error: string }>
    };

    // Tenta conectar uma vez para todas as mensagens
    if (this.autoConnect && !this.client.isConnected()) {
      await this.connect();
    }

    for (const item of messages) {
      try {
        const success = await this.sendToGroup(item.groupId, item.message, item.type || 'text');
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            groupId: item.groupId,
            message: item.message,
            error: 'Falha ao enviar mensagem'
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          groupId: item.groupId,
          message: item.message,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }
}

export default WhatsappService;
