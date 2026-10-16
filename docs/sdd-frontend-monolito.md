# SDD Frontend - Daily Sorte Astroengine (Monolítico)

## Arquitetura
- **Stack:** React + Vite + TypeScript
- **UI:** Tailwind CSS
- **Estado:** Zustand
- **Auth:** Keycloak JS Adapter
- **HTTP:** Axios
- **Forms:** React Hook Form + Zod

## Estrutura
`
frontend/
+-- src/app/              # providers, routes, init
+-- src/features/         # auth, profile, dashboard
+-- src/shared/           # lib, hooks, ui components
+-- package.json
+-- vite.config.ts
`

## Fluxo de Auth
1. Usuário acessa / 
2. Se não autenticado ? redirect Keycloak
3. Keycloak retorna JWT
4. Frontend envia JWT para Kong
5. Kong valia JWT ? Backend
6. GET /api/profile ? 404 se não existe ? /perfil
7. Profile OK ? /dashboard

## Profile Form
Campos:
- birthDate: obrigatório, não futuro, =13 anos
- phone: opcional, +55 XX XXXXX-XXXX

## Endpoints API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| GET /api/profile | - | Busca profile (404 = não existe) |
| POST /api/profile | - | Cria profile, retorna sign |
| GET /v1/horoscope/daily | - | ?sign=aries&lang=pt |

## Signo
**BACKEND calcula o signo** - frontend só exibe

## Estado (Zustand)
`	ypescript
interface AuthState {
  user: User | null;
  profile: Profile | null;
  sign: ZodiacSign | null;
  isAuthenticated: boolean;
}
`

## Componentes
- AuthProvider - Contexto Keycloak
- ProtectedRoute - Guarda rotas
- ProfileForm - Formulário cadastro
- HoroscopeCard - Tela principal

## Backend Necessário
- GET /api/profile - buscar perfil
- POST /api/profile - criar perfil + calcular signo

## Checklist
- [ ] Setup Vite + React
- [ ] Tailwind CSS
- [ ] Keycloak SDK
- [ ] AuthProvider + ProtectedRoute
- [ ] ProfileForm + validação
- [ ] Dashboard
- [ ] Axios interceptors
- [ ] Mobile responsive

