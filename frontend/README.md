# Daily Sorte Frontend

Frontend SPA React para a aplicação Daily Sorte Astroengine.

## Arquitetura

- **Framework:** React 18 + Vite 5
- **UI:** Tailwind CSS + Radix UI
- **Estado:** Zustand (com persistência) + React Query
- **Roteamento:** React Router DOM v6
- **Autenticação:** Keycloak JS Adapter
- **HTTP:** Axios com interceptors

### Gerenciamento de Dados

- **React Query:** Para queries e mutations
- **Zustand:** Para estado global (user, profile, sign)
- **Cache:** 5 minutos para profiles, 1 hora para horóscopos

## Estrutura

```
src/
├── app/                    # App configuration
│   └── stores/             # Zustand stores
├── features/               # Feature modules
│   ├── auth/              # Authentication
│   ├── profile/           # Profile management
│   ├── dashboard/         # Main dashboard
│   └── horoscope/         # Horoscope features
├── shared/                 # Shared utilities
│   ├── lib/               # API client, zodiac helpers
│   ├── hooks/             # Custom hooks
│   └── ui/                # UI components
└── styles/                # Global styles
```

## Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
VITE_KEYCLOAK_URL=https://keycloak.domain.com/auth
VITE_KEYCLOAK_REALM=daily-sorte
VITE_KEYCLOAK_CLIENT_ID=frontend-spa
VITE_API_URL=http://localhost:3333
```

## Fluxo de Usuário

1. Usuário acessa aplicação
2. Se não autenticado → redirect para Keycloak
3. Após login → verifica se tem profile (`/api/profile`)
4. Se não tem → redireciona para `/perfil`
5. Usuário preenche data de nascimento e telefone
6. Backend calcula signo automaticamente
7. Redireciona para `/dashboard`

## API

O frontend consome as seguintes rotas:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/profile` | GET | Busca profile (404 se não existe) |
| `/api/profile` | POST | Cria profile, retorna sign |
| `/v1/horoscope/daily` | GET | Horóscopo do dia |

## Backend Necessário

Para funcionar, o backend precisa ter:
- Endpoint `GET /api/profile` (autenticado)
- Endpoint `POST /api/profile` (cria + calcula signo)