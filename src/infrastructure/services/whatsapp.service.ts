/**
 * WhatsApp Service - Integração com API Oficial do WhatsApp Business
 * 
 * Nota: Esta implementação usa uma abordagem simplificada para evitar custos do Twilio.
 * A API Oficial do WhatsApp Business requer:
 * - Conta Meta Business
 * - Número de telefone verificado
 * - Token de acesso
 * - Webhook setup
 * 
 * Esta classe foi desenhada para ser substituída/extensível quando as credenciais
 * da API oficial estiverem disponíveis, mantendo compatibilidade com o perfil do usuário.
 */

export interface WhatsAppMessage {
  to: string;        // número de telefone do destinatário
  text: string;      // mensagem de texto
  sign?: string;     // signo opcional
  horoscope?: string; // previsão opcional
  sentAt?: Date;     // data/hora de envio
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  status: 'sent' | 'pending' | 'failed';
  error?: string;
}

export class WhatsAppService {
  private readonly baseUrl = 'httpsgraph.facebook.com/v20.0';
  private readonly token: string;
  private readonly phoneNumberId: string;

  constructor(token: string, phoneNumberId: string) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
  }

  /**
   * Envia mensagem via WhatsApp Business API
   * @param message - objeto com dados da mensagem
   * @returns resultado do envio
   */
  async send(message: WhatsAppMessage): Promise<WhatsAppSendResult> {
    const { to, text, sign, horoscope } = message;

    // Monta o texto completo a ser enviado
    let fullMessage = text;

    // Adiciona signo e horóscopo se fornecidos
    const signPart = sign ? `\n\nSigno: ${sign}` : '';
    const horoscopePart = horoscope ? `\nPrevisão: ${horoscope}` : '';

    if (signPart || horoscopePart) {
      fullMessage += signPart + horoscopePart;
    }

    // Monta o payload para a API do WhatsApp
    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      message: fullMessage,
    };

    try {
      const response = await fetch(
        `httpsgraph.facebook.com/v20.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data: any = await response.json();

      if (response.ok) {
        const msgId = data.messages && data.messages[0] ? data.messages[0].id : undefined;
        return {
          success: true,
          messageId: msgId,
          status: 'sent',
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: data.error?.message || 'Falha desconhecida da API',
        };
      }
    } catch (err) {
      return {
        success: false,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Erro de conexão',
      };
    }
  }

  /**
   * Formata uma mensagem de horóscopo para WhatsApp
   */
  formatHoroscopeMessage(sign: string, prediction: string, luckyNumber?: number, color?: string): string {
    let msg = `✨ Seu Horóscopo do Dia ✨\n\n[Signo]: ${sign}\n[Prediction]: ${prediction}`;

    if (luckyNumber) {
      msg += `\n[Número da sorte]: ${luckyNumber}`;
    }
    if (color) {
      msg += `\n[Cor]: ${color}`;
    }

    msg += `\n\n✨ Boa sorte! ✨`;

    return msg;
  }
}