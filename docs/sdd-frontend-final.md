# SDD Frontend - Daily Sorte Astroengine (Monolítico)

## Arquitetura

**Stack:** React + Vite + Tailwind CSS + Zustand + React Router DOM v6

**Estrutura:**
```
frontend/
├── src/app/              # providers, routes, init
├── src/features/         # auth, profile, dashboard, horoscope
├── src/shared/           # lib/api.ts, hooks, ui components
├── public/index.html
├── vite.config.ts
└── package.json
```

## Fluxo de Autenticação

1. Usuário acessa `/`
2. Se não autenticado → redirect para Keycloak
3. Keycloak retorna JWT
4. Frontend envia JWT para Kong
5. Kong valida → Backend retorna profile ou 404
6. 404 → redireciona para `/perfil`
7. Profile OK → redireciona para `/dashboard`

## Profile Form

**Campos:**
- `birthDate`: obrigatório, não futuro, mínimo 13 anos
- `phone`: opcional, formato +55 XX XXXXX-XXXX

**Validação:** React Hook Form + Zod

## Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/profile` | GET | Busca profile (404 = não existe) |
| `/api/profile` | POST | Cria profile, retorna `sign` |
| `/v1/horoscope/daily` | GET | Horóscopo: ?sign=aries&lang=pt |

## Signo

**O signo é calculado pelo BACKEND**, não pelo frontend.

O frontend recebe: `{ userId, birthDate, phone, sign, ... }`

## Estado Global (Zustand)

```typescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  sign: ZodiacSign | null;
  isAuthenticated: boolean;
}
```

## Gerenciamento de Dados (React Query)

**React Query** para queries suyenagas com cache e sincronização:

### Hooks implementados

```typescript
// useQueries.ts
- useProfile() - GET profile
- useCreateProfile() - POST profile  
- useUpdateProfile() - PUT profile
- useDailyHoroscope(sign) - GET horóscopo do dia
```

### Configuração React Query

- **Stale Time:** 5 min (profile), 1h (horóscopo)
- **Cache Time:** 10 min
- **Retry:** 1 tentativa para mutations, 3 para queries
- **Error Handling:** 404 não retry (perfil não existe ainda)

## Componentes Principais

- `AuthProvider` - Contexto de autenticação Keycloak
- `ProtectedRoute` - Guarda rotas autenticadas
- `ProfileForm` - Formulário de cadastro
- `HoroscopeCard` - Tela principal
- `ZodiacWheel` - Visualizador de signo

## Backend Necessário

Criar endpoints:
- `GET /api/profile` - busca perfil
- `POST /api/profile` - cria perfil + calcula signo

## Checklist

- [ ] Setup Vite + React
- [ ] Tailwind CSS
- [ ] Keycloak SDK
- [ ] AuthProvider + ProtectedRoute
- [ ] ProfileForm + validação
- [ ] Dashboard + HoroscopeCard
- [ ] Axios interceptors
- [ ] Mobile responsive

## Comandos

```bash
npm run dev      # localhost:5173
npm run build    # produção
npm run lint
```

---

**Status:** ✅ Pronto para implementação