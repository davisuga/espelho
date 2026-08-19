# Espelho

**Treine com seu cliente antes de falar com ele.**

Espelho transforma um histórico real de conversas em um cliente simulado com
limites claros de evidência. Você pratica por voz, recebe coaching ligado ao
histórico e pode voltar a um momento para tentar outra abordagem.

## What we built today

- Evidence-bounded customer twin extraction
- Epistemic KNOWN / LIKELY / UNKNOWN model
- GPT Realtime voice rehearsal
- Evidence-backed call analysis
- Research-backed coaching
- Rewind-and-retry conversation branching
- Reliable fictionalized Jordan Belfort demo fixture
- Unit tests for the deterministic domain core

## Architecture

Functional core / imperative shell. Pure immutable domain functions live in
`src/domain`; OpenAI, Realtime, microphone, and browser behavior stay at the
application boundaries.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `OPENAI_API_KEY` in `.env.local`. If the hackathon provides GPT-Live preview
access, set its model ID once in `NEXT_PUBLIC_OPENAI_LIVE_MODEL`.

## Test

```bash
npm test
npm run lint
npm run build
```
