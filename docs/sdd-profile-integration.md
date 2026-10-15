# Software Design Document: Cliente Profile Integration

## 1. Overview

Este documento descreve a arquitetura e o fluxo de dados para a integração de perfis de cliente entre:
- **Identity Provider:** Keycloak (autenticação e gerenciamento de usuários)
- **API Gateway:** Kong (roteamento e validação de tokens)
- **Backend:** Application API (lógica de negócio e persistência)
- **Database:** Supabase (armazenamento de permissões e preferências)

O objetivo é permitir que usuários autenticados via Keycloak tenham seus perfis sincronizados automaticamente no sistema, incluindo preferências de idioma, notificações e informações de contato.

## 2. Architecture Diagram

```
┌──────────────┐      JWT          ┌─────────┐      OAuth2     ┌──────────────┐
│   Frontend   │◄─────────────────►│ Keycloak│◄───────────────►│  Users DB    │
└──────────────┘                   └─────────┘                 └──────────────┘
          │                                                      │
          │ HTTP/REST (Bearer Token)                           User
          │                                                      │
          ▼                                                      ▼
┌──────────────┐      Forwarded      ┌──────────┐      Insert/Update  ┌───────────────┐
│     Kong     │◄───────────────────►│ Backend  │◄───────────────────►│  Supabase PR  │
└──────────────┘    Request + JWT    └──────────┘                     │  (PostgreSQL) │
          │                                                           └───────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            profiles Table                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │ user_id     │  │ phone       │  │ preferred_language/notification │   │
│  │ (PK)        │  │             │  │ _opt_in                         │   │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

## 3. Data Model

### 3.1 Supabase Schema (`profiles` table)

Reference: `migrations/0001_init.sql:22-29`

```sql
create table if not exists public.profiles (
  user_id             text        primary key,
  phone               text,
  preferred_language  text        not null default 'pt',
  notification_opt_in boolean     not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

### 3.2 TypeScript Interface (`Profile`)

Reference: `src/infrastructure/database/models/profile.model.ts:4-11`

```typescript
export interface IProfile {
  userId: string;       // Referência ao usuário (do Keycloak ou local)
  phone: string;        // número de celular para notificação
  preferredLanguage: string;  // idioma preferido ('pt', 'en', etc.)
  notificationOptIn: boolean; // concordância para receber notificação
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. Token Flow

### 4.1 Authentication Flow (Initial Creation)

1. **Frontend** inicia sessão com Keycloak
2. Keycloak retorna **JWT** contendo:
   - `sub`: Unique identifier (UUID) do usuário
   - `preferred_username`: Nome de usuário
   - `email`: Email principal
   - `name`: Nome completo
3. JWT é enviado junto com todas as requisições ao Backend
4. Kong valida o token e verifica roles/permissions
5. Se válido, Redireciona ao Backend com Authorization Header

### 4.2 Token Structure (Keycloak)

```json
{
  "sub": "123e4567-e89b-12d3-a456-426614174000", // User UUID
  "preferred_username": "johndoe",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "preferred_language": "pt",
  "iat": 1697000000,
  "exp": 1697006600
}
```

> **Nota:** `preferred_language` pode ser mapeado de claims do Keycloak se configurado via mapper

## 5. Integration Steps

### 5.1 Backend Endpoint (Planned)

```typescript
// src/modules/profiles/controllers/profile.controller.ts (to be created)

async function createOrUpdateProfile(
  userId: string,
  profileData: Partial<IProfile>
): Promise<IProfile> {
  const existing = await getProfile(userId);

  if (existing) {
    return await saveProfile({
      ...existing,
      ...profileData,
      userId,
    });
  }

  return await saveProfile({
    userId,
    ...profileData,
  });
}
```

### 5.2 Kong Configuration

**API Routes:**
- `/api/profile` → Backend Service (Authenticated)

**Keycloak Plugin Configuration (in Kong):**
```yaml
plugins:
  - keycloak:
      config:
        oidc_discovery_url: https://keycloak.domain/auth/realms/{realm}
        client_id: {client_id}
        client_secret: {client_secret}
        realm: {realm}
        required_claims:
          - sub     # User ID will be in JWT sub claim
          - name
          - preferred_language
```

### 5.3 Service Worker / Middleware (Proactive/on-demand)

O sistema deve adotar uma abordagem **proativa** para garantir que o perfil existe sempre que necessário:

```typescript
// src/infrastructure/services/profile-sync.service.ts (to be created)

export class ProfileSyncService {
  private static instance: ProfileSyncService;

  static async ensureProfileCreated(userId: string): Promise<void> {
    const profile = await getProfile(userId);

    if (!profile) {
      // Sync from Keycloak claims if available
      await saveProfile({
        userId,
        phone: null, // Default: not provided
        preferredLanguage: 'pt', // Default
        notificationOptIn: false, // Default
      });
    }
  }

  static async updateProfilePreferences(
    userId: string,
    updates: { phone?: string; preferredLanguage?: string; notificationOptIn?: boolean }
  ): Promise<void> {
    const profile = await getProfile(userId);
    if (profile) {
      await saveProfile({ ...profile, ...updates, userId });
    }
  }
}
```

## 6. Database Preparedness

The database is already prepared for this integration:

- ✅ `profiles` table exists in `migrations/0001_init.sql:22-29`
- ✅ Primary key configured: `user_id`
- ✅ Defaults: `preferred_language='pt'`, `notification_opt_in=false`
- ✅ Timestamps managed automatically via triggers or defaults
- ✅ Indexes ready for querying by `user_id`
- ✅ RLS (Row Level Security) configured for API roles

## 7. Security Considerations

1. **JWT Validation**: Kong must enforce JWT validity before reaching Backend
2. **User ID Sourcing**: User ID from JWT (`sub` claim) becomes Primary Key
3. **Permissions**: Keyspace-level auth via Supabase RLS policies
4. **Idempotency**: Upsert pattern ensures profile is created only once per user
5. **Audit Trail**: `created_at` and `updated_at` timestamps provide visibility

## 8. Future Extensions

When Immediate Frontend Integration is Ready:

1. **Autofill Preferences**:
   - Sync `preferred_language` from Keycloak claims to `profiles.preferred_language`
   - Sync `email_verified` to `profiles.phone` (if configured)

2. **Multi-language Support**:
   - Expand `preferred_language` enum: ['pt', 'en', 'es', 'fr', 'de']
   - Add fallback rules in UI components

3. **Notification Preferences**:
   - Add channels: ['email', 'sms', 'push']
   - Add frequency: ['daily', 'weekly', 'realtime']

4. **Profile Completion Management**:
   - Track completion percentage for surveys
   - Add missing fields: profile data, address, preferences

## 9. Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | `profiles` table ready |
| TypeScript Model | ✅ Complete | `profile.model.ts` ready |
| Backend Controller | ✅ To Be Created | At profile creation trigger |
| Kong Config | ✅ To Be Created | OIDC Plugin configured |
| Frontend UI | ⏸️ Pending | Cannot be done yet (as per requirement) |

## 10. Configuration Requirements

Add to `.env` (Backend):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Keycloak (for reference/configuring Kong)
KEYCLOAK_REALM=daily-sorte
KEYCLOAK_CLIENT_ID=sorte-astroengine
KEYCLOAK_URL=https://keycloak.example.com/auth
```

Add to Kong (Admin API):

```bash
## Create Keycloak Plugin
curl -X POST http://localhost:8001/plugins \
  --data name=keycloak \
  --data config.oidc_discovery_url="https://keycloak.internal/auth/realms/{realm}" \
  --data config.client_id="daily-sorte-web" \
  --data config.client_secret="<secret>" \
  --data config.realm="{realm}" \
  --data config.required_claims='["sub","name"]'
```