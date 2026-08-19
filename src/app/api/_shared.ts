import { z } from "zod";
import type { ApiError } from "@/domain/schemas";

export class RequestTimeoutError extends Error {
  constructor() {
    super("A solicitação excedeu o tempo limite.");
    this.name = "RequestTimeoutError";
  }
}

export const withTimeout = async <T>(promise: Promise<T>, ms = 30_000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_resolve, reject) => {
      globalThis.setTimeout(() => reject(new RequestTimeoutError()), ms);
    }),
  ]);

export const apiError = (code: string, message: string, status: number): Response =>
  Response.json({ error: { code, message } } satisfies ApiError, { status });

export const invalidBody = (error: z.ZodError): Response =>
  apiError(
    "invalid_request",
    error.issues.at(0)?.message ?? "Dados da solicitação inválidos.",
    400,
  );

export const providerFailure = (error: unknown): Response =>
  error instanceof RequestTimeoutError
    ? apiError("provider_timeout", "A OpenAI demorou demais para responder.", 504)
    : apiError(
        "provider_failure",
        error instanceof Error ? error.message : "Não foi possível concluir a solicitação.",
        502,
      );
