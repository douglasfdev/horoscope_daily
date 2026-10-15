#!/usr/bin/env node

/**
 * Script para conectar ao WhatsApp e gerar QR Code
 * Uso: npx ts-node scripts/connect-whatsapp.ts
 */

import { WhatsappService } from '../src/infrastructure/adapters/whatsapp/whatsapp.service.impl';

const SESSION_NAME = process.env.WA_SESSION || 'whatsapp_session';
const DEFAULT_GROUP_ID = process.env.DEFAULT_GROUP_ID || '1203631234567890@g.us';

console.log('=== Conexão WhatsApp ===');
console.log('Sessão:', SESSION_NAME);
console.log('Aperte Ctrl+C para cancelar\n');

async function connect(): Promise<void> {
  try {
    const service = new WhatsappService({ 
      autoConnect: true
    });

    console.log('Conectando ao WhatsApp...');
    await service.connect();
    
    console.log('\n🎉 Conexão realizada com sucesso!');
    console.log('A sessão é salva automaticamente.');
    console.log('Para reconectar no futuro, rode este script novamente.\n');
    
    // Mantém a conexão aberta por 30 segundos para escanear QR
    await new Promise(r => setTimeout(r, 30000));
    await service.disconnect();
    
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Erro ao conectar:', errorMessage);
    process.exit(1);
  }
}

connect();