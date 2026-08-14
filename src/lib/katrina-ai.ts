import { createServerFn } from "@tanstack/react-start";
import { MENU_CATEGORIES, KATRINA_INFO, fetchLiveMenuByCategory, mergeLiveMenu } from "@/data/menu";

async function formatMenuForPrompt(): Promise<string> {
  const live = await fetchLiveMenuByCategory();
  const categories = mergeLiveMenu(live);
  return categories.map((cat) => {
    const items = cat.items
      .map((item) => {
        const price =
          item.price ?? (item.priceWhole ? `entera ${item.priceWhole} / media ${item.priceHalf}` : "consultar");
        const desc = item.description ? ` — ${item.description}` : "";
        return `  - ${item.name}: ${price}${desc}`;
      })
      .join("\n");
    return `${cat.label}${cat.subtitle ? ` (${cat.subtitle})` : ""}:\n${items}`;
  }).join("\n\n");
}

async function systemPrompt(mesa?: string): Promise<string> {
  const menu = await formatMenuForPrompt();
  return `Sos el asistente virtual de Katrina, un restobar en ${KATRINA_INFO.direccion}.
Horario: ${KATRINA_INFO.horario}.
WhatsApp para pedidos y consultas puntuales: +${KATRINA_INFO.whatsapp}.
${mesa ? `El cliente que te escribe está en la Mesa ${mesa}.` : ""}

Esta es la carta completa y real del local (nunca inventes platos, precios ni tragos que no estén acá):

${menu}

Reglas:
- Respondé corto, en español rioplatense/salteño informal, como un mozo copado.
- Si preguntan por un plato/trago, decí precio y descripción tal cual está arriba.
- Si preguntan algo que no sabés (reservas, alergias específicas, stock del día), decí que consulten directo al mozo o por WhatsApp — no inventes.
- Si quieren pedir algo, decile que aprieten Agregar en la carta y después Llamar al mozo. Vos no tomás pedidos.`;
}

type ChatTurn = { role: "user" | "assistant"; content: string };

export const askKatrinaAi = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as { question: string; mesa?: string; history?: ChatTurn[] })
  .handler(async ({ data }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        reply:
          "El asistente de IA todavía no está configurado en este local. Escribinos por WhatsApp y te respondemos al toque.",
        configured: false,
      };
    }

    const messages = [
      { role: "system", content: await systemPrompt(data.mesa) },
      ...(data.history ?? []).slice(-6),
      { role: "user", content: data.question },
    ];

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: 0.4,
          max_tokens: 300,
        }),
      });

      if (!res.ok) {
        console.error("[katrina-ai] Groq error", res.status, await res.text());
        return {
          reply: "Se me trabó la cabeza un segundo. Probá de nuevo o escribinos por WhatsApp.",
          configured: true,
        };
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = json.choices?.[0]?.message?.content?.trim();
      return {
        reply: reply || "No te entendí bien, ¿me lo repetís de otra forma?",
        configured: true,
      };
    } catch (err) {
      console.error("[katrina-ai] fetch failed", err);
      return {
        reply: "No me pude conectar ahora. Escribinos por WhatsApp mientras tanto.",
        configured: true,
      };
    }
  });
