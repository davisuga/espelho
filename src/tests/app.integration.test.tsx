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

    await user.click(screen.getByRole("button", { name: "Use Jordan example" }));
    await user.click(screen.getByRole("button", { name: /Create twin/i }));
    expect(await screen.findByRole("heading", { name: "Meet Mariana" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Start rehearsal/i }));
    expect(await screen.findByText("We could not start audio.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Continue in text mode/i }));

    const input = screen.getByRole("textbox", { name: "Your line" });
    await user.type(input, "Nossa plataforma tem automações, dashboard e integrações.");
    await user.click(screen.getByRole("button", { name: "Send line" }));
    expect(await screen.findByText(/como isso vai simplificar/i)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "End rehearsal" }));
    expect(await screen.findByText("67")).toBeVisible();
    expect(screen.getByText("Your performance, dimension by dimension")).toBeVisible();
    expect(await screen.findByRole("heading", { name: /moment worth retrying/i })).toBeVisible();
    expect(screen.getByText("Você perdeu Mariana aqui")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /Retry from this moment/i }));
    await waitFor(() => expect(screen.getByText("Second attempt")).toBeVisible());
    expect(await screen.findByText("We could not start audio.")).toBeVisible();
  });
});
