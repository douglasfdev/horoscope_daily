export interface IWhatsappService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  sendToGroup(groupId: string, message: string, type?: 'text' | 'html'): Promise<boolean>;
  sendBatch(messages: Array<{ groupId: string; message: string; type?: 'text' | 'html' }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ groupId: string; message: string; error: string }>;
  }>;
}

export interface IWhatsappClient {
  sendMessage(jid: string, message: any): Promise<void>;
  formatJid(number: string): string;
}
