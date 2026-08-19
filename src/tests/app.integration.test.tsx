import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EspelhoApp } from "@/components/EspelhoApp";
import { analysisFixture, twinFixture } from "./fixtures";

describe("Espelho fallback happy path", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path.endsWith("/api/twin")) return Response.json(twinFixture);
      if (path.endsWith("/api/text-turn")) {
        return Response.json({
          customerMessage: "Antes das funcionalidades, como isso vai simplificar a rotina da equipe?",
        });
      }
      if (path.endsWith("/api/analyze")) return Response.json(analysisFixture);
      return Response.json({ error: { message: "Unexpected request" } }, { status: 500 });
    }));
  });

  it("loads the sample, rehearses in text, analyzes and rewinds", async () => {
    const user = userEvent.setup();
    render(<EspelhoApp />);

    await user.click(screen.getByRole("button", { name: "Usar exemplo" }));
    await user.click(screen.getByRole("button", { name: /Criar espelho/i }));
    expect(await screen.findByRole("heading", { name: "Conheça Mariana" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Ensaiar conversa/i }));
    expect(await screen.findByText("Não conseguimos iniciar o áudio.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Continuar em modo texto/i }));

    const input = screen.getByRole("textbox", { name: "Sua fala" });
    await user.type(input, "Nossa plataforma tem automações, dashboard e integrações.");
    await user.click(screen.getByRole("button", { name: "Enviar fala" }));
    expect(await screen.findByText(/como isso vai simplificar/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Encerrar ensaio" }));
    expect(await screen.findByRole("heading", { name: /momento que vale refazer/i })).toBeVisible();
    expect(screen.getByText("Você perdeu Mariana aqui")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Refazer deste momento/i }));
    await waitFor(() => expect(screen.getByText("Segunda tentativa")).toBeVisible());
    expect(await screen.findByText("Não conseguimos iniciar o áudio.")).toBeVisible();
  });
});
