#!/usr/bin/env node

/**
 * Script CLI para enviar mensagens WhatsApp
 * Uso: npx ts-node scripts/send-whatsapp-message.ts "Mensagem" [--group "ID"] [--type "text|html"]
 */

import { WhatsappService } from '../src/infrastructure/adapters/whatsapp/whatsapp.service.impl';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let message = '';
  let groupId = process.env.DEFAULT_GROUP_ID || '1203631234567890@g.us';
  let type: 'text' | 'html' = 'text';

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--group' && args[i + 1]) {
      groupId = args[i + 1]; i++;
    } else if (args[i] === '--type' && args[i + 1]) {
      if (args[i + 1] === 'html' || args[i + 1] === 'text') {
        type = args[i + 1] as 'text' | 'html';
      }
      i++;
    }
  }

  // Get message (first non-flag argument)
  message = args.find(a => !a.startsWith('--')) || '';

  if (!message) {
    console.log('Uso: npx ts-node scripts/send-whatsapp-message.ts "Mensagem" [--group "ID"] [--type "text|html"]');
    console.log('\nExemplos:');
    console.log('  npx ts-node scripts/send-whatsapp-message.ts "Teste de conexão"');
    console.log('  npx ts-node scripts/send-whatsapp-message.ts "Alerta" --group "1203631234567890@g.us"');
    console.log('  npx ts-node scripts/send-whatsapp-message.ts "<b>HTML</b>" --type html');
    process.exit(1);
  }

  console.log('═════════════════════════════════════');
  console.log('       Enviando Mensagem WhatsApp');
  console.log('═════════════════════════════════════');
  console.log('Grupo:', groupId);
  console.log('Tipo:', type);
  console.log('Mensagem:', message);
  console.log('═════════════════════════════════════\n');

  try {
    const service = new WhatsappService({ autoConnect: true });
    const success = await service.sendToGroup(groupId, message, type);

    if (success) {
      console.log('\n✅ Mensagem enviada com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Falha ao enviar mensagem');
      console.log('Verifique se o grupo permite mensagens de fora.');
      process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Erro:', errorMessage);
    process.exit(1);
  }
}

main();