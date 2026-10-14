# API

## Endpoints

### GET /v1/horoscope/daily
Get daily horoscope based on zodiac sign.

**cURL Example:**
```bash
curl -X GET "http://localhost:3333/v1/horoscope/daily?sign=aries&lang=pt&date=2026-10-14"
```

**Query Parameters:**
- `sign` (required): Zodiac sign
- `lang` (optional): Language, defaults to "pt"
- `date` (optional): Target date (YYYY-MM-DD). Upstream sources only publish today's horoscope, so any other date falls back to today's result.

**200 Response:**
```json
{
  "sign": "string",
  "language": "string",
  "date": "string",
  "prediction": "string",
  "luckyNumber": 0,
  "color": "string",
  "compatibility": ["string"],
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

**500 Response:**
```json
{
  "error": "string",
  "message": "string"
}
```

### POST /v1/astro/natal-chart
body birth chart.

**cURL Example:**
```bash
curl -X POST "http://localhost:3333/v1/astro/natal-chart" \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "latitude": -23.55, "longitude": -46.63}'
```

**Body Parameters:**
- `birthDate` (required): Birth date (YYYY-MM-DD)
- `birthTime` (required): Birth time (HH:MM)
- `latitude` (required): Latitude
- `longitude` (required): Longitude
- `timezone` (optional): Timezone, defaults to "America/Sao_Paulo"

**201 Response:**
```json
{
  "message": "Mapa astral gerado com sucesso",
  "chartId": "string",
  "generatedAt": "2024-01-01T00:00:00.000Z"
}
```

**500 Response:**
```json
{
  "error": "string",
  "message": "string"
}
```