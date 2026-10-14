# Especificificação de Implementação: MongoDB, Autentificação e Notificação

## Visão Geral

Este documento descreve a implementação de:
1. **Autenticação** via Keycloak/Kong (OAuth2/OIDC)
2. **Armazenamento** de eventos no MongoDB
3. **Notificação** via e-mail e WhatsApp

O objetivo é disparar e-mails ou WhatsApp aos usuários com seu horóscopo do dia, sem senhas serem armazenadas no banco da aplicação.

---

## 1. Autentificação com Keycloak/Kong

### 1.1 Fllow de Autenticação

```
Cliente → Keycloak (OIDC) → JWT Token → Aplicação → MongoDB → Notificação
```

### 1.2 Configuração Keycloak

**Realm:** `daily-sorte`
**Clients:**
- `frontend`: Aplicação web
- `api-gateway`: Backend API

**Users:** Gerenciados exclusivamente pelo Keycloak (não armazenados no banco da aplicação)

**Endpoints:**
- `POST /auth/login` - Login via OIDC
- `POST /auth/logout` - Logout
- `GET /api/horoscope/*` - Rotas protegidas (validam JWT)

**Headers:**
- `Authorization: Bearer <jwt_token>` - Todas as requests protegidas

### 1.2.1 JWT Payload (usuário)

```json
{
  "sub": "user_123",       // ID do usuário no Keycloak
  "preferred_username": "joao Silva",
  "email": "joao@email.com",
  "role": "user"
}
```

### 1.2.2 Middleware Fastify

```typescript
// src/infrastructure/http/middleware/auth.middleware.ts
import fp from 'fastify-plugin'
import fpJwt from '@fastify/jwt'

export default fp(async (instance, _, next) => {
  instance.jwt = {
    secret: process.env.JWT_SECRET || 'm-chave-secreta-muito-longa-e-segura',
  }

  instance.authenticate = async (request, reply) => {
    try {
      await instance.jwt.verifyHeader(request.headers.authorization)
    } catch (err) {
      reply.code(401).send({ error: 'Não autorizado', mensagem: err.message })
    }
  }
  
  await next()
})
```

---

## 2. MongoDB Schema - Eventos

### 2.1 Modelo Mongoose

```typescript
// src/infrastructure/database/models/event.model.ts
import { Schema, model, Types } from 'mongoose';

export interface IEvent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;          // Referência ao usuário no Keycloak (ou ID local)
  type: 'horoscope_generated' | 'login' | 'logout' | 'whatsapp_sent' | 'email_sent';
  status: 'pending' | 'sent' | 'failed';
  payload: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['horoscope_generated', 'login', 'logout', 'whatsapp_sent', 'email_sent'] 
    },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'sent', 'failed'], 
      default: 'pending' 
    },
    payload: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {}
    },
  },
  { timestamps: true }
);

// Índices para performance
EventSchema.index({ userId: 1, type: 1, status: 1 });
EventSchema.index({ status: 1 });

export const Event = model<IEvent>('Event', EventSchema);
```

### 2.2 Casos de Uso

#### 2.1.1 Criar Evento de Horôscopo

```typescript
// src/application/use-cases/send-horoscope.use-case.ts
import { injectable } from 'inversify';
import { model, Document, Types } from 'mongoose';
import { getRedis } from '../infrastructure/messaging';
import { EmailService } from '../infrastructure/services/email.service';
import { WhatsAppService } from '../infrastructure/services/whatsapp.service';

@injectable()
export class SendHoroscopeUseCase {
  
  constructor(
    @model('Event') private eventModel: model.Document & { _id: Types.ObjectId },
    private emailService: EmailService,
    private whatsAppService: WhatsAppService
  ) {}

  async execute(sign: string, userId: Types.ObjectId, lang: string = 'pt', recipient?: { email?: string, phone?: string }) {
    // 1. Gerar horóscopo
    const horoscope = await this.generateHoroscope(sign, lang);
    
    // 2. Criar evento (pending)
    const event = await this.eventModel.create({
      userId,
      type: 'horoscope_generated',
      status: 'pending',
      payload: { sign, lang, horoscope }
    });
    
    // 2.5 Inicializar Redis se não estiver
    try { await getRedis(); } catch { /* ignora se já existir */ }
    
    // 3. Enviar notificação (async)
    this.sendNotification(event, horoscope, recipient);
    
    return horoscope;
  }

  private async sendNotification(event: any, horoscope: any, recipient?: { email?: string, phone?: string }) {
    // Atualizar status para sending
    event.status = 'sent';
    await event.save();
    
    // Enviar via e-mail
    if (recipient?.email) {
      await this.emailService.send(recipient.email, {
        sign: payload.sign,
        horoscope,
        sentAt: new Date()
      });
    }
    
    // Enviar via WhatsApp
    if (recipient?.phone) {
      await this.whatsAppService.send(recipient.phone, {
        sign: payload.sign,
        horoscope,
        sentAt: new Date()
      });
    }
    
    // Atualizar status final
    event.status = 'sent';
    await event.save();
  }
}
```

### 2.2 Eventos de Login/Logout

```typescript
// Exemplos de criação de eventos
await Event.create({
  userId: userId,
  type: 'login',
  status: 'sent',
  payload: { ip: request.ip, userAgent: request.headers['user-agent'] }
});

await Event.create({
  userId: userId,
  type: 'logout',
  status: 'sent',
  payload: { duration: timeSpent, reason: 'user_initiated' }
});
```

---

## 3. Serviços de Notificação

### 3.1 Serviço de E-mail

```typescript
// src/infrastructure/services/email.service.ts
import nodemailer from 'nodemailer';
import { config } from '../config';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.smtpHost || 'smtp.gmail.com',
    port: config.smtpPort || 587,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    },
    tls: {
      enabled: config.smtpTls === true
    }
  });

  async send(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: config.smtpFrom || 'no-reply@daily-sorte.com',
      to,
      subject: `[Daily Sorte] ${subject}`,
      html
    });
  }
}
```

### 3.2 Serviço de WhatsApp

```typescript
// src/infrastructure/services/whatsapp.service.ts
import Twilio from 'twilio';

export class WhatsAppService {
  private client = Twilio({
    accountSid: process.env.TWilio_ACCOUNT_SID,
    authToken: process.env.TWilio_AUTH_TOKEN,
    mobilityId: process.env.TWilio_MOBILITY_ID
  });

  async send(to: string, message: string): Promise<void> {
    await this.client.messages.create({
      from: process.env.TWilio_FROM_NUMBER,
      to,
      body: message
    });
  }
}
```

### 3.3 Mensagem Padrão

```
� ✨ Seu Horóscopo do Dia ✨

[Signo]: Áries
[Prediction]: Um dia cheio de oportunidades inesperadas...
[Número da sorte]: 9
[Cor]: Vermelho

✨ Boa sorte! ✨
```

---

## 4. Arquitetura de Fila (Background Worker)

### 4.1 BullMQ (alternativa a RabbitMQ)

```typescript
// src/infrastructure/workers/horoscope-worker.ts
import BullMQ from 'bullmq';
import { Event } from '../database/models/event.model';
import { SendHoroscopeUseCase } from '../application/use-cases/send-horoscope.use-case';

const horoscopeQueue = new BullMQ.Queue('horoscope-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || 6379),
  }
});

// Worker process
horoscopeQueue.process(async (message) => {
  const { eventId, recipient } = message.data;
  
  try {
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'pending') return;
    
    // Executar caso de uso
    await sendHoroscopeUseCase.execute(
      event.payload.sign,
      event.userId,
      event.payload.lang,
      recipient
    );
    
  } catch (err) {
    // Marcar como falha
    await Event.findByIdAndUpdate(eventId, {
      status: 'failed',
      $set: { 'payload.error': err.message }
    });
  }
});
```

### 4.2 Worker Registration

```typescript
// src/main.ts (bootstrap)
import { initRedis } from '../infrastructure/messaging';
import { Queue } from 'bullmq';

async function bootstrap() {
  // ...
  
  // Inicializar fila worker
  await initRedis(); // Garante Redis conectado
  
  // O BullMQ worker será iniciado separadamente via CLI
  // bullmq process --queue horoscope-notifications
}
```

### 4.2 Alternativa: RabbitMQ

Se preferir RabbitMQ em vez de BullMQ, a arquitetura seria:

1. **Producer**: A aplicação insere evento no MongoDB e publica na fila RabbitMQ
2. **Consumer**: Serviço separado consome da fila e envia e-mail/WhasApp
3. **ACK**: Após enviar, atualiza status do evento no MongoDB

### 4.3 Topics/Exchange (RabbitMQ)

```yaml
# configuração ideal
queues:
  - name: horoscope-notifications
    binding_key: horoscope.#
    args: { 'x-deadletter-exchange': 'horoscope-deadletter' }

exchanges:
  - name: horoscope-notifications
    type: 'topic'
```

---

## 5. Fluxo Completo - Do Login ao E-mail/WhatsApp

```mermaid
flowchart TD
    A[Usuário faz Login] -->| Keycloak OIDC | B[Retorna JWT Token]
    B --> C[Aplicação valida JWT]
    C --> C1{Horóscopo Gerado?}
    C1 -->| Sim | C2[Inserir Evento MongoDB status=pending]
    C1 -->| Não | C11[Erro 400]
    
    C2 --> D{Fila Worker?}
    C2 -->| Sim | D1[Worker pega evento pendente]
    C2 -->| Não | D11[Horário agendado]
    
    D1 --> E{Tipo de Notificação?}
    D1 -->| E-mail | D2[EmailService.send()]
    D1 -->| WhatsApp | D3[WhatsAppService.send()]
    D1 -->| Ambos | D4[Ambas as funções]
    
    D2 & D3 & D4 --> E1[Atualizar evento status=sent]
    E1 --> F[Retornar resposta ao usuário]
    F --> G[Usuário recebe notificação]
    
    style D1 fill:#f9f,stroke:#333,stroke-width:2px
    style D2 fill:#bbf,stroke:#333,stroke-width:2px
    style D3 fill:#bbf,stroke:#333,stroke-width:2px
```

### 4.4 Exceções e Error Handling

```typescript
// Error types classification

enum ErrorType {
  AUTHENTICATION = 'authentication',      // JWT inválido/expirado
  EVENT_CREATION = 'event_creation',     // Falha ao salvar no MongoDB
  NOTIFICATION = 'notification',         // Falha ao enviar e-mail/WhasApp
  REDIS = 'redis',                       // Falha de conexão Redis
  QUEUE = 'queue',                       // Falha na fila/BullMQ/RabbitMQ
}

interface IErrorResponse {
  type: ErrorType;
  message: string;
  timestamp: Date;
  requestId?: string;
  correlationId?: string;
}
```

---

## 6. Segurança e Boas Práticas

### 5.1 Senhas Nunca no Banco

```
✅ Keycloak armazena senhas (features nativas)
✅ A aplicação apenas valida token JWT
✅ Nunca: armazena senha clara, hash simples sem sal
✅ Se precisar: use Vault ou AWS Secrets Manager
```

### 5.2 Validações Necessárias

```typescript
// Validações por tipo de evento

function validateEventPayload(type: string, payload: any): boolean {
  switch (type) {
    case 'horoscope_generated':
      return !!payload.sign && !!payload.lang;
    case 'login':
      return !!payload.ip && !!payload.userAgent;
    case 'logout':
      return true; // sempre válido
    case 'email_sent':
      return !!payload.recipientEmail;
    case 'whatsapp_sent':
      return !!payload.recipientPhone;
    default:
      return false;
  }
}
```

### 5.3 Rate Limiting por Usuário

```typescript
// Fastify rate limit por usuário JWT

instance.registerPlugin(fpJwt);

// Por rota
fastify.get('/api/horoscope/daily', {
  rateLimit: {
    max: 5, // 5 requests por usuário
    timeLimit: 60 // em segundos
  },
  schema: { ... }
})
```

### 5.4 Logging Estruturado

```typescript
// Estruturado com pino ou fastify logger

fastify.log.info({
  correlationId: request.id,
  userId: jwt.sub,
  eventType: 'horoscope_generated',
  status: 'pending',
  sign: payload.sign
}, 'Evento criado');

// Erros estruturado
fastify.log.error({
  error: err.message,
  stack: err.stack,
  userId: jwt?.sub
}, 'Falha ao processar horóscopo');
```

---

## 7. Rotas da API

### 7.1 Autentificação

```typescript
// src/infrastructure/http/routes/auth.route.ts
fastify.post('/auth/login', async (request, reply) => {
  // Keycloak verification happens via JWT
  // Se token válido, retorna user info
  // Se inválido, 401
});

fastify.post('/auth/logout', async (request, reply) => {
  // Invalidates token session
  reply.code(200).send({ message: 'Logout successful' });
});
```

### 7.2 Horóscopo

```typescript
// src/infrastructure/http/routes/horoscope.route.ts
fastify.post('/horoscope/daily', {
  schema: {
    body: {
      type: 'object',
      required: ['sign'],
      properties: {
        sign: { type: 'string' },
        lang: { type: 'string', default: 'pt' },
      },
    },
  },
  async (request, reply) => {
    // 1. Validar JWT (middleware global)
    // 2. Validar parâmetros
    // 3. Chamar caso de uso
    // 4. Retornar horóscopo + inserir evento pendente
    
    const horoscope = await sendHoroscopeUseCase.execute(
      request.body.sign,
      request.user.id,      // do JWT middleware
      request.body.lang,
      // recipient pode ser opcional ou vindo do perfil do usuário
    });
    
    reply.code(200).send(horoscope);
  },
})
```

### 7.3 Perfil do Usuário

```typescript
fastify.get('/perfil', async (request, reply) => {
  // Retorna e-mail e telefone do usuário
  // Vindo do perfil do Keycloak ou banco próprio
  reply.code(200).send({
    email: jwt.preferred_username || 'usuario@dominio.com',
    phone: '5511999998888' // se configurado
  });
});
```

---

## 8. Deploy e Operações

### 8.1 Docker Compose (com MongoDB, Redis, Worker)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:5-alpine
    ports: ['27017:27017']
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: pass

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']
    volumes:
      - redis_data:/data

  api:
    build: .
    ports: ['3333:3333']
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - MONGO_URI=mongodb://admin:pass@mongo:27017/daily-sorte-astro
      - JWT_SECRET=chave-super-segura
      - SMTP_HOST=smtp.gmail.com
      - SMTP_USER=user@gmail.com
      - SMTP_PASS=senha-do-smtp
      - TWilio_ACCOUNT_SID=conta-twilio
      - TWilio_AUTH_TOKEN=token-twilio
      - TWilio_FROM_NUMBER=+5511999990000

  # Worker process (rodando separadamente)
  # worker:
  #   command: bullmq process --queue horoscope-notifications
  #   depends_on: [redis, api]
```

### 8.2 Variáveis de Ambiente (.env)

```env
# Segurança
JWT_SECRET=chave-super-segura-muito-longa-e-complexa

# Conexões
REDIS_URI=rediss://:valid-moose-232668@valid-moose-232668.upstash.io:6379
MONGODB_URI=mongodb://admin:pass@mongo:27017/daily-sorte-astro

# Autentificação
KEYCLOAK_ISSUER=https://keycloak.dominio.com/auth
KEYCLOAK_CLIENT_ID=frontend
KEYCLOAK_CLIENT_SECRET=client-secret-do-keycloak

# E-mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=user@gmail.com
SMTP_PASS=senha-do-smtp
SMTP_FROM=no-reply@daily-sorte.com

# WhatsApp (Twilio)
TWilio_ACCOUNT_SID=conta-id
TWilio_AUTH_TOKEN=token-secret
TWilio_FROM_NUMBER=+5511999990000

# Aplicação
NODE_ENV=production
PORT=3333
```

### 8.3 Monitoramento

```bash
# Health check endpoints

# GET /health
# Retorna: { status: 'ok', dependencies: { mongodb: 'ok', redis: 'ok' } }

# Métricas via Prometheus
# - event_pending_count
# - event_sent_count
# - event_failed_count
# - auth_failures
# - notification_failures

# Alertas
# - > 10% failures no envio de e-mail/whasApp
# - Redis conectado?
# - MongoDB lagando?
# - Keycloak token expirando?
```

---

## 9. Roadmap de Implementação

### Fase 1 (2 semanas)
- [x] Keycloak integration + JWT auth
- [x] Rotas de login/logout
- [ ] MongoDB Event schema básico
- [ ] Estrutura de pastas e imports

### Fase 2 (2 semanas)
- [ ] Email service (SMTP/nodemailer)
- [ ] WhatsApp service (Twilio)
- [ ] Casos de uso: send-horoscope
- [ ] Rotas: horoscope/daily com evento pendente

### Fase 3 (1 semana)
- [ ] Worker BullMQ ou RabbitMQ
- [ ] Fila de processamento assíncrono
- [ ] Atualização de status eventos

### Fase 4 (1 semana)
- [ ] Rate limiting por usuário
- [ ] Logging estruturado
- [ ] Health checks e métricas
- [ ] Documentação API completa

### Fase 5 (Opicional)
- [] Painel admin para visualizar eventos
- [] Estatísticas de entrega (open rates, etc.)
- [] A/B testing de horários
- [] Integração com mais canais (SMS, Push)

---

## 10. Perguntas Frequentes

### 1. Precisamos realmente de Keycloak?

**Sim.** Evita armazenar senhas no banco, centraliza auth, permite SSO, MFA, e a aplicação f apenas valida tokens.

### 2. Por que não armazenar senha no MongoDB?

**Por segurança e compliance.** Vazamento de banco = senhas expostas. Com Keycloak, só perde acesso ao sistema, não senhas de outros serviços.

### 3. Por que usar ioredis com Upstash em vez de driver oficial?

**Por custo e simplicidade.** O driver oficial do Upstash pode ter limitações ou custo adicional. O ioredis com URL format `rediss://token@host:port` funciona nativamente e é mais flexível.

### 3. BullMQ ou RabbitMQ?

**BullMQ** é mais simples para filas Node.js (usando Redis). **RabbitMQ** é mais enterprise/tradicional. A escolha depende da equipe existente.

### 4. Precisamos de ambos e-mail + WhatsApp?

Depende do seu público. Se o usuário cadastrou ambos, envie ambos. Se só um, envie só esse. O payload do evento deve indicar quais canais usar.

### 5. Como garantir que o e-mail não vá para spam?

- Usar domínio verificado (gmail/outlook/outros)
- Incluir link de descadastro
- Evitar conteúdo spam-like
- Usar serviços transacionais (SendGrid, Mailgun) para alta deliverability

### 6. Como rastrear se o usuário leu o e-mail/WhatsApp?

- **E-mail:** Tracking pixels (abertura)
- **WhatsApp:** Não há leitura report padrão; usar botões de interação ou questionários

---

## 11. Próximos Passos Imediatos

1. **Configurar Keycloak** (realm, clients, users)
2. **Implementar middleware auth** no Fastify
3. **Criar schemas MongoDB** (Event)
4. **Implementar serviços** (Email + WhatsApp)
5. **Criar casos de uso** (send-horoscope)
6. **Integrar rotas** (horoscope/daily com evento)
7. **Testar fluxo completo** (login → horário → notificação)

---

## 12. Checklist de Implementação

```
[ ] Keycloak configurado (realm + clients)
[ ] JWT middleware no Fastify operacional
[ ] Schemas MongoDB criados e testados
[ ] Services de e-mail testados (envio simples)
[ ] Services de WhatsApp testados (envio simples)
[ ] Caso de uso send-horoscope implementado
[ ] Rotas API com evento pendente funcionando
[ ] Worker/BullMQ configurado e testando
[ ] Rate limiting implementado
[ ] Logging estruturado ativo
[ ] Health checks operacionais
[ ] Deploy em ambiente staging
[ ] Testes de load (simular 100 usuarios simultâneos)
[ ] Documentação API Swagger/OpenAPI
[ ] Deploy em produção
```

---

## 13. Contato e Suporte

Para dúvidas sobre implementação específica:
- **Arquitetura:** Revisar com líder técnico
- **Keycloak:** Consultar documentação oficial ou especialista Keycloak
- **Infrastructure:** Time de DevOps
- **Dúvidas técnicas:** Esta especificação

---
---

*Documento gerado em: `$(date +%Y-%m-%d)`
*Versão: 1.0.0
*Status: Em desenvolvimento - revisão necessária após validação de requisitos de negócio