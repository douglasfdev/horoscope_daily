# Daily Sorte & AstroEngine

Micro SaaS de astrologia e sorte do dia, construído com Fastify, TypeScript e arquitetura Hexagonal (Ports & Adapters).

## Estrutura do Projeto

```
src/
├── domain/                    # Regras de Negócio Puras
│   ├── entities/              # Entidades (HoroscopeResult, AstrologicalSign)
│   └── value-objects/         # Value Objects (Language, Date, Location)
├── application/               # Casos de Uso e Portas
│   ├── use-cases/             # Casos de uso (GetDailyHoroscope, GenerateAdvancedNatalChart)
│   └── ports/                 # Interfaces (HoroscopeEnginePort, AstroCalculationPort)
├── infrastructure/            # Implementação Concreta
│   ├── adapters/
│   │   ├── astro-libs/        # Adapters das bibliotecas locais
│   │   │   ├── horoscopefree.adapter.ts
│   │   │   └── astrolink.adapter.ts
│   │   └── repositories/      # Adapters MongoDB
│   │       ├── mongo-horoscope.repository.ts
│       └── mongo-astro.repository.ts
│   └── http/                  # Rotas Fastify
│       ├── horoscope.route.ts
│       └── natal-chart.route.ts
└── config/                    # Configuração
    └── opentelemetry.ts

## Bibliotecas Locais

### horoscopefree
- Fornece horóscopo diário multilíngue (suporte nativo a Português)
- Cache local em disco embutido
- Usado via HoroscopeFreeAdapter

### Astrolink (Swiss Ephemeris)
- Cálculos astrológicos de alta precisão
- Mapas natais, posições planetárias, casas astrológicas
- Usado via AstrolinkEngineAdapter

## API Endpoints

### GET /v1/horoscope/daily
Parâmetros de query:
- `sign`: signo (ex: "aries", "taurus")
- `lang`: idioma (ex: "pt", "en", "es")

Retorna horóscopo do dia com indicação de cache hit.

### POST /v1/astro/natal-chart
Corpo JSON:
- `birthDate`: data de nascimento (formato date)
- `birthTime`: hora de nascimento (formato HH:MM)
- `latitude`: latitude (-90 a 90)
- `longitude`: longitude (-180 a 180)

Retorna mapa astral calculado com Swiss Ephemeris.

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes
npm test
```

## Licença

MIT