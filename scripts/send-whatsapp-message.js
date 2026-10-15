#!/usr/bin/env node
const { WhatsappService } = require(\x27./src/infrastructure/adapters/whatsapp/whatsapp.service.impl\x27);
async function main() {
  const args = process.argv.slice(2);
  let message = \x27\x27;
  let groupId = process.env.DEFAULT_GROUP_ID || \x271203631234567890@g.us\x27;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === \x27--group\x27 && args[i + 1]) {
      groupId = args[i + 1];
      i++;
    }
  }
  const messageArg = args.find(a => !a.startsWith(\x27--\x27));
  message = messageArg || \x27\x27;
  if (!message) {
    console.log(\x27Uso: node scripts/send-whatsapp-message.js  Mensagem [--group ID]\x27);
    process.exit(1);
  }
  console.log(\x27Enviando mensagem para:\x27, groupId);
  try {
    const service = new WhatsappService({ autoConnect: true });
    const success = await service.sendToGroup(groupId, message);
    if (success) {
      console.log(\x27✅ Mensagem enviada com sucesso!\x27);
    } else {
      console.log(\x27❌ Falha ao enviar mensagem\x27);
    }
  } catch (error) {
    console.error(\x27❌ Erro:\x27, error.message);
  }
}
main();

