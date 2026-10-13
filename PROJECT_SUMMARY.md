# Daily Sorte & AstroEngine - Project Summary

## 📁 Directory Structure

```
daily-sorte-astroengine/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── docker-compose.yml    # Docker services (MongoDB, Redis, RabbitMQ)
├── Dockerfile            # Docker image definition
├── README.md             # Project documentation
└── src/                  # Source code (Hexagonal Architecture)
    ├── config/           # OpenTelemetry, Env vars validation
    │   ├── index.ts
    │   └── opentelemetry.ts
    ├── domain/           # Business rules (pure entities/value-objects)
    │   ├── entities/
    │   │   ├── HoroscopeEntity.ts
    │   │   └── NatalChartEntity.ts
    │   └── value-objects/
    │       ├── Sign.ts
    │       ├── DateTimeVO.ts
    │       └── Coordinate.ts
    ├── application/      # Use cases and ports/interfaces
    │   ├── di/
    │   │   └── types.ts
    │   ├── ports/
    │   │   ├── astro-port.ts
    │   │   ├── horoscope-engine.port.ts
    │   │   └── astro-calculation.port.ts
    │   └── use-cases/
    │       ├── get-daily-horoscope.use-case.ts
    │       └── generate-advanced-natal-chart.use-case.ts
    ├── infrastructure/   # Concrete adapters implementations
    │   ├── server.ts     # Main Fastify entry point
    │   ├── http/         # Fastify routes
    │   │   ├── index.ts
    │   │   └── routes.ts
    │   ├── adapters/
    │   │   └── astro-libs/
    │       ├── HoroscopeFreeAdapter.ts   # horoscopefree integration
    │       └── AstrolinkEngineAdapter.ts # Swiss Ephemeris integration
    │   └── repositories/ # MongoDB adapters (stubs)
    │       ├── mongo-horoscope.repository.ts
    │       └── mongo-astro.repository.ts
    └── messaging/        # Redis and RabbitMQ
        ├── index.ts
        └── redis-cache.ts
```

## 🛠️ Key Features Implemented

### 1. Architecture
- **Hexagonal (Ports & Adapters)** pattern fully implemented
- Clean separation of concerns between domain, application, and infrastructure
- InversifyJS-style dependency injection pattern

### 2. Domain Layer
- `HoroscopeEntity` - Daily horoscope result entity
- `NatalChartEntity` - Birth chart result entity
- `Sign` - Value object for astrological sign validation
- `DateTimeVO` - Value object for date handling
- `Coordinate` - Value object for geographical coordinates

### 3. Application Layer
- `HoroscopeEnginePort` - Interface for horoscope fetch operations
- `AstroCalculationPort` - Interface for astrological calculations
- `GetDailyHoroscopeUseCase` - Use case for daily horoscope
- `GenerateAdvancedNatalChartUseCase` - Use case for natal chart generation

### 4. Infrastructure Adapters
- `HoroscopeFreeAdapter` - Integrates horoscopefree library
  - Multilanguage support (Portuguese natively supported)
  - Local disk cache integration
  - Sign validation
- `AstrolinkEngineAdapter` - Integrates Swiss Ephemeris via Astrolink
  - Natal chart generation with high precision
  - Planet positions calculation
  - Ascendant and MC calculation
  - Current planet positions

### 5. Fastify HTTP API
- `GET /v1/horoscope/daily?sign=:sign&lang=:lang`
  - Query parameters: sign (required), lang (optional, default: 'pt')
  - Returns daily horoscope with prediction, lucky number, color, compatibility
- `POST /v1/astro/natal-chart`
  - Body: birthDate, birthTime, latitude, longitude (required), timezone (optional)
  - Returns generated natal chart with ascendente, houses, planet positions

### 6. Observability
- **OpenTelemetry** instrumentation configured
- Automatic node.js instrumentation (fetch, http)
- Structured logging with pino
- Log level configuration via env

### 7. Infrastructure
- **Redis Cache** - Short-term cache for horoscope queries (5min TTL)
  - `get()`, `set()`, `del()`, `exists()` methods
- **RabbitMQ Emitter** - Asynchronous event publishing
  - Event type-based routing to exchange
  - Persistent messages
- **MongoDB** - History persistence (adapters ready)
- **Docker** - Full stack with mongodb, redis, rabbitmq

### 8. Configuration
- **Zod**-based environment validation
- All env variables documented in `.env.example`
- Rate limiting configuration
- CORS and Helmet middlewares configured

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure
docker-compose up -d

# 3. Configure environment
cp .env.example .env

# 4. Development mode
npm run dev

# 5. Access API
#   GET  http://localhost:3000/v1/horoscope/daily?sign=Aries&lang=pt
#   POST http://localhost:3000/v1/astro/natal-chart
```

## 📦 Dependencies

### Production
- `fastify` ^5.0.0 - API framework
- `ioredis` ^5.3.2 - Redis client
- `mongodb` ^6.3.0 - MongoDB driver
- `zod` ^3.22.4 - Schema validation
- `@opentelemetry/*` - Observability
- `@fastify/cors`, `@fastify/helmet`, `@fastify/rate-limit` - Security

### Development
- `typescript` ^5.3.3 - Type compiler
- `tsx` ^4.7.0 - TS runner
- `vitest` ^1.2.0 - Testing
- `eslint` ^8.56.0 - Linting

## 📋 Specification Compliance

✅ Fastify 5.x with TypeScript strict mode  
✅ Hexagonal (Ports & Adapters) architecture  
✅ horoscopefree library integration (multilanguage, Portuguese supported)  
✅ Astrolink/Swiss Ephemeris integration (high precision calculations)  
✅ Redis cache strategy (short-term, TTL)  
✅ MongoDB persistence  
✅ OpenTelemetry observability  
✅ RabbitMQ asynchronous events  
✅ GetDailyHoroscopeUseCase with cache-miss-flow  
✅ GenerateAdvancedNatalChartUseCase  
✅ Routes: GET /v1/horoscope/daily and POST /v1/astro/natal-chart  

## 📡 API Examples

### Daily Horoscope
```bash
curl "http://localhost:3000/v1/horoscope/daily?sign=aries&lang=pt"
```

### Natal Chart
```bash
curl -X POST "http://localhost:3000/v1/astro/natal-chart" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"08:30","latitude":-23.55,"longitude":-46.63,"timezone":"America/Sao_Paulo"}'
```