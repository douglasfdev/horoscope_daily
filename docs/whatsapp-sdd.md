# SDD Test
## 📋 Visão Geral
Sistema nativo de notificação por WhatsApp usando a biblioteca aileys (WhatsApp Web API). Envia mensagens diretamente para um grupo WhatsApp sem necessidade de provedores terceiros como Twilio.
## 🎯 Objetivos
- ✅ Disparar notificações para grupo WhatsApp
- ✅ Usar biblioteca nativa Baileys (sem Twilio ou outros provedores)
- ✅ Evitar spam enviando para grupo em vez de números individuais
- ✅ Autenticação via QR Code
- ✅ Sessão persistente e reutilizável
## 📦 Dependências
### Bibliotecas necessárias
`ash
pm install @whiskeys/baileys qrcode-terminal
``n### Variáveis de ambiente (.env)
`ash# WhatsApp Session
WA_SESSION=whatsapp_session
WA_QRCODE_TIMEOUT=60000
`
## 🏗️ Arquitetura do Sistema
``nscripts/whatsapp/
├── index.js           # Funções principais de envio
├── qrcode.js          # Geração e exibição de QR Code
├── connection.js      # Gerenciamento de conexão
└── config.js          # Configurações

src/
└── services/
    └── WhatsappService.js # Classe de serviço principal

scripts/
├── send-whatsapp-notification.js  # Script de exemplo
└── connect-whatsapp.js          # Script de conexão
`
## 🔧 Fluxo de Trabalho
### 1. Configuração Inicial
`ash
pm install @whiskeys/baileys qrcode-terminal
# Configurar .env com credenciais
``n### 2. Conexão
`ash
ode scripts/connect-whatsapp.js
# Após primeira vez, sessão é salva automaticamente
``n### 3. Enviar Notificação
`ash
ode scripts/send-whatsapp-notification.js " 🔔 Alerta: Sistema offline\ --group \1203631234567890@g.us\
``n### 4. Via Código
` ypescript
import { WhatsappService } from \../src/services/WhatsappService\;

const whatsapp = new WhatsappService();
await whatsapp.connect();
await whatsapp.sendToGroup(\1203631234567890@g.us\, \🔔 Alerta importante\);
``n
## 📋 Estrutura de Arquivos
### scripts/whatsapp/index.js
- Funções de envio de mensagens
- Manipulação de grupo
- Formatação de mensagem
### scripts/whatsapp/qrcode.js
- Geração de QR Code
- Exibição no console
### scripts/whatsapp/connection.js
- Gerenciamento de sessão
- Reconexão automática
### src/services/WhatsappService.js
- Classe principal de serviço
- Métodos de conexão e envio
- Tratamento de erros

## ⚠️ Considerações Importantes
### Segurança
- ✅ QR Code gerado localmente, nunca enviado a terceiros
- ✅ Sessão salva no diretório .wwebjs_auth`n- ✅ Dados sensíveis via variáveis de ambiente
### Boas Práticas
- 📌 Sempre use grupos em vez de números individuais (evita spam)
- 📌 Limite de mensagens: WhatsApp limita ~1 mensagem/hora para grupos não conhecidos
- 📌 O grupo deve ter o número do bot como membro/admin
- 📌 Desconecte após uso em produção
### Limitações Técnicas
- 🔄 Biblioteca usa versão Web do WhatsApp (WhatsApp Web)
- 🔄 Requer que o telefone do usuário tenha internet e WhatsApp aberto
- 🔄 Sessão persiste, mas pode expirar a cada alguns dias
- 🔄 Mensagens para grupos não conhecidos podem demorar um pouco
### Erros Comuns
- **QR Code expirado**: Gere novo com flag --reset`n- **Group ID inválido**: Verifique no link wa.me/GROUP_ID`n- **Conexão lenta**: Verifique se o phone tem internet
- **Mensagem não entrega**: Grupo pode ter restrições ou bot não é admin

## ✅ Checklist de Aplicação
Antes de aplicar este SDD, verifique:
- [ ] Node.js instalado (versão 16+ recomendada)
- [ ] Baileys instalado: 
pm install @whiskeys/baileys qrcode-terminal`n- [ ] Grupo WhatsApp criado com Group ID conhecido
- [ ] Variáveis de ambiente configuradas no .env`n- [ ] QR Code gerado e escaneado pelo menos uma vez
- [ ] Número do grupo no formato correto: 1203631234567890@g.us`n- [ ] Testes realizados em ambiente de desenvolvimento primeiro

## 📊 Exemplos de Uso
### Envio via linha de comando
`ash
# Mensagem simples
node scripts/send-whatsapp-notification.js \Sistema: energia retornando\\n

# Com grupo especificado
node scripts/send-whatsapp-notification.js \⚠️ Alerta: Manutenção às 20h\ --group \1203631234567890@g.us\\n

# Com formatação HTML
node scripts/send-whatsapp-notification.js \<b>⚠️ Alerta</b>: Sistema offline\ --type html --group \1203631234567890@g.us\\n``n### Envio via TypeScript/JavaScript
` ypescript
import { WhatsappService } from \../src/services/WhatsappService\;

async function enviarAlerta(mensagem: string) {
 const whatsapp = new WhatsappService();
 await whatsapp.connect();
 await whatsapp.sendToGroup(
 \1203631234567890@g.us\,
 mensagem
 );
}
``n
## 🔄 Próximos Passos
1. Instalar dependências 
pm install @whiskeys/baileys qrcode-terminal
2. Executar 
ode scripts/connect-whatsapp.js para gerar QR Code
3. Escanear QR Code com o WhatsApp
4. Testar envio com 
ode scripts/send-whatsapp-notification.js \Teste de conexão\
5. Integrar ao sistema de origem das notificações

## 🐛 Troubleshooting
| Problema | Solução |
| QR Code não aparece | Rode 
pm run wa:connect novamente |
| Sessão expirada | Delete pasta _.wwebjs_auth e gere novo QR |
| Mensagem não chega | Verifique se o grupo permite mensagens de fora |
| Conexão lenta | Certifique-se de que o phone tem dados/ wifi |

## 📚 Referências
- Baileys GitHub: https://github.com/adiwajshing/baileys
- Documentação: https://github.com/adiwajshing/baileys/blob/master/README.md
- Exemplos: https://github.com/adiwajshing/baileys-examples
    