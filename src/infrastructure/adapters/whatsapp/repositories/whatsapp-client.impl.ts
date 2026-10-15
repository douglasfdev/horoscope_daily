import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  downloadContentFromMessage
} from '@whiskey/baileys';
import { IWhatsappClient } from '../../../application/ports/whatsapp.service.port';
import whatsappConfig from '../../../domain/configuration/whatsapp.config';
import { diag } from '../../../config/opentelemetry';

interface WhatsappClientConfig {
  printQRInTerminal?: boolean;
  markOnlineOnConnect?: boolean;
}

export class WhatsappClient implements IWhatsappClient {
  private socket: any = null;
  private clientConfig: WhatsappClientConfig;
  private store = makeInMemoryStore({ save: true });

  constructor(clientConfig: WhatsappClientConfig = {}) {
    this.clientConfig = clientConfig || {};
  }

  async connect(): Promise<void> {
    try {
      if (this.socket) {
        diag.info('Já conectado. Usando conexão existente.');
        return;
      }

      const { state, saveCreds } = await useMultiFileAuthState(whatsappConfig.waSession);

      diag.info('Conectando ao WhatsApp...');
      
      this.socket = makeWASocket({
        auth: state,
        printQRInTerminal: this.clientConfig.printQRInTerminal || true,
        markOnlineOnConnect: this.clientConfig.markOnlineOnConnect ?? true,
      });

      // Atualiza loja de sessões
      this.store.bind(this.socket.ev);

      // Tratamento do QR Code
      this.socket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          diag.info('=== QR CODE GERADO ===');
          console.log('Escaneie o QR Code acima no WhatsApp');
          require('qrcode-terminal').generate(qr, { small: true });
        }

        if (connection === 'close') {
          const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            diag.info('Tentando reconexão...');
            await this.connect();
          }
        } else if (connection === 'open') {
          diag.info('Conexão com WhatsApp estabelecida!');
        }
      });

      // Salvar credenciais
      this.socket.ev.on('creds.update', saveCreds);

    } catch (error) {
      diag.error('Erro ao conectar:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.socket) {
        await this.socket.logout();
        this.socket = null;
        diag.info('Conexão encerrada.');
      }
    } catch (error) {
      diag.error('Erro ao desconectar:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.socket !== null;
  }

  formatJid(number: string): string {
    if (number.includes('@g.us')) return number;
    const whatsappNumber = number.replace(/[^0-9]/g, '');
    return `whatsapp:${whatsappNumber}@s.whatsapp.net`;
  }

  async sendMessage(jid: string, message: any): Promise<void> {
    try {
      if (!this.socket) {
        throw new Error('Cliente não está conectado');
      }

      const formattedJid = this.formatJid(jid);

      if (typeof message === 'string') {
        await this.socket.sendMessage(formattedJid, { text: message });
      } else {
        await this.socket.sendMessage(formattedJid, message);
      }

    } catch (error) {
      diag.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}

export default WhatsappClient;
