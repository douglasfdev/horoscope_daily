# Sistema de Notificação por WhatsApp - Implementação

## 📋 Visão Geral

Sistema nativo de notificação por WhatsApp usando a biblioteca `baileys` (WhatsApp Web API). Envia mensagens diretamente para um grupo WhatsApp sem necessidade de provedores terceiros como Twilio.

**Arquitetura:** Hexagonal (Ports & Adapters) - Alinhada com o projeto Fastify/TypeScript existente.

## 🎯 Objetivos

- ✅ Disparar notificações para grupo WhatsApp
- ✅ Usar biblioteca nativa Baileys (sem Twilio ou outros provedores)
- ✅ Evitar spam enviando para grupo em vez de números individuais
- ✅ Autenticação via QR Code
- ✅ Sessão persistente e reutilizável
- ✅ Integrado ao OpenTelemetry (usando `diag`)

## 📦 Dependências

```bash
npm install @whiskeys/baileys qrcode-terminal qrcode
```

## 📋 Variáveis de Ambiente

Adicione ao seu `.env`:

```bash
WA_SESSION=whatsapp_session          # Nome da pasta de sessão
WA_QRCODE_TIMEOUT=60000              # Timeout para QR Code
SCAM_GROUP_ID=1203631234567890@g.us   # ID do grupo para notificações
DEFAULT_GROUP_ID=1203631234567890@g.us # ID padrão
```

## 🏗️ Estrutura de Arquivos

```
src/
├── domain/configuration/whatsapp.config.ts          # Configurações
├── application/ports/whatsapp.service.port.ts       # Interfaces (Port)
├── application/use-cases/whatsapp/index.ts          # Casos de uso
├── infrastructure/adapters/whatsapp/
│   ├── whatsapp.service.impl.ts                     # Service Principal
│   └── repositories/whatsapp-client.impl.ts         # Cliente Baileys
└── infrastructure/adapters/http/whatsapp.routes.ts  # Rotas Fastify (futuro)

scripts/
├── connect-whatsapp.ts                              # Conexão e QR Code
└── send-whatsapp-message.ts                         # Envio via CLI
```

## 🔧 Como Usar

### 1. Conexão Inicial (Primeira Vez)

```bash
# Gerar QR Code e escanear
npx ts-node scripts/connect-whatsapp.ts
```

Após escanear o QR Code, a sessão será salva em `whatsapp_session/`.

### 2. Enviar Mensagem via CLI

```bash
# Mensagem simples
npx ts-node scripts/send-whatsapp-message.ts "Teste de conexão"

# Com grupo específico
npx ts-node scripts/send-whatsapp-message.ts "Alerta: Manutenção às 20h" --group "1203631234567890@g.us"

# Com formatação HTML
npx ts-node scripts/send-whatsapp-message.ts "<b>⚠️ Alerta</b>: Sistema offline" --type html
```

### 3. Via Código TypeScript

```typescript
import { WhatsappService } from './src';

// Usando o service diretamente
const service = new WhatsappService({ autoConnect: true });
await service.sendToGroup('1203631234567890@g.us', '🔔 Alerta: Sistema offline', 'text');

// Usando casos de uso
import { SendMessageUseCase } from './src/application/use-cases/whatsapp';

const whatsappService = new WhatsappService({ autoConnect: true });
const sendMessageUseCase = new SendMessageUseCase(whatsappService);
await sendMessageUseCase.execute('Mensagem importante', { 
  groupId: '1203631234567890@g.us',
  type: 'text'
});
```

### 4. Envio em Lote

```typescript
import { SendBatchUseCase } from './src/application/use-cases/whatsapp';

const batchUseCase = new SendBatchUseCase(whatsappService);
const result = await batchUseCase.execute([
  { message: 'Mensagem 1' },
  { message: 'Mensagem 2', options: { groupId: 'outro-grupo@g.us' } }
]);

console.log(\`Enviadas: \${result.success}, Falhas: \${result.failed}\`);
```

## 📊 Arquitetura

### Portas (Interfaces)

**IWhatsappService**
- `connect()` - Conectar ao WhatsApp
- `disconnect()` - Desconectar
- `isConnected()` - Estado da conexão
- `sendToGroup()` - Enviar mensagem para grupo
- `sendBatch()` - Envio em lote

**IWhatsappClient**
- `connect()` - Conectar via Baileys
- `disconnect()` - Desconectar
- `formatJid()` - Formatar número para JID
- `sendMessage()` - Enviar mensagem

### Adaptadores

- **WhatsappService** - Orquestra a comunicação, usa OpenTelemetry
- **WhatsappClient** - Implementa Baileys, QR Code via `qrcode-terminal`

### Logging

Usa OpenTelemetry (`diag`) para logging:
- `diag.info()` - Informações
- `diag.error()` - Erros

## ⚠️ Considerações Importantes

### Segurança
- QR Code gerado localmente, nunca enviado a terceiros
- Sessão salva localmente (pasta `whatsapp_session/`)
- Dados sensíveis via variáveis de ambiente

### Boas Práticas
- Sempre use grupos em vez de números individuais (evita spam)
- WhatsApp limita ~1 mensagem/hora para grupos não conhecidos
- O grupo deve ter o número do bot como membro
- Desconecte após uso em produção

### Limitações Técnicas
- Biblioteca usa versão Web do WhatsApp (WhatsApp Web)
- Requer telefone com internet e WhatsApp aberto
- Sessão pode expirar a cada alguns dias
- Mensagens para grupos não conhecidos podem demorar

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| QR Code não aparece | Verifique logs e conexão do phone |
| Sessão expirada | Delete pasta `whatsapp_session/` e gere novo QR |
| Mensagem não chega | Grupo pode ter restrições ou bot não é admin |
| Conexão lenta | Phone deve ter internet e WhatsApp aberto |
| Error: Connection failed | Verifique Group ID e permissões |

## 📚 Referências

- [Baileys GitHub](https://github.com/adiwajshing/baileys)
- [Documentação Baileys](https://github.com/adiwajshing/baileys/blob/master/README.md)
- [Exemplos](https://github.com/adiwajshing/baileys-examples)

---

✅ **Pronto para uso!** Sistema implementado com arquitetura hexagonal, Integrado ao OpenTelemetry e totalmente tipado em TypeScript.