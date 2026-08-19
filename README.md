# Espelho

**Treine com seu cliente antes de falar com ele.**

MVP criado para hackathon que transforma um histórico real em um espelho da cliente limitado às evidências, permite ensaiar por voz ou texto e refazer um momento específico da conversa.

## O que construímos

- Extração de customer twin com evidências verificadas
- Modelo epistemológico KNOWN / LIKELY / UNKNOWN
- Ensaio de voz com OpenAI Realtime e WebRTC
- Fallback integral em texto
- Análise de comportamento com evidências da cliente e pesquisa estática
- Rewind para uma segunda tentativa sem alterar o transcript original
- Testes unitários, de API e integração

## Arquitetura

Functional core / imperative shell. O reducer, prompts, validações, transformações de transcript e replay são puros; OpenAI, WebRTC, microfone e browser ficam isolados nos adaptadores.

## Rodar

```bash
npm install
copy .env.example .env.local
npm run dev
```

Preencha `OPENAI_API_KEY` em `.env.local`. Os modelos são configuráveis por `OPENAI_TEXT_MODEL` e `OPENAI_REALTIME_MODEL`.

## Verificar

```bash
npm test
npm run lint
npm run build
```
