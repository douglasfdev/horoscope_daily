#!/usr/bin/env node

/**
 * Script para conectar ao WhatsApp e gerar QR Code
 */

const { WhatsappService } = require('../src/infrastructure/adapters/whatsapp/whatsapp.service.impl');

const SESSION_NAME = process.env.WA_SESSION || 'whatsapp_session';
const DEFAULT_GROUP_ID = process.env.DEFAULT_GROUP_ID || '1203631234567890@g.us';

console.log('=== Conexão WhatsApp ===');
console.log('Sessão:', SESSION_NAME);
console.log('Aperte Ctrl+C para cancelar
');

async function connect() {
  try {
    const service = new WhatsappService({ 
      autoConnect: true
    });

    console.log('Conectando ao WhatsApp...');
    await service.connect();
    
    // Sessão persiste após desconexão
    // QR Code só precisará ser gerado na primeira vez
    console.log('🎉 Conexão realizada com sucesso!');
    console.log('A sessão é salva. Para reconectar, rode este script novamente.');
    
    await new Promise(r => setTimeout(r, 10000));
    await service.disconnect();
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao conectar:', error.message);
    process.exit(1);
  }
}

connect();
