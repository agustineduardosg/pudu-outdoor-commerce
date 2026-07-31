import { Resend } from "resend";
import { z } from "zod";
import { demoModeAllowed } from "@/lib/server/env";
import { ConfigurationError } from "@/lib/server/errors";
import { errorResponse, jsonResponse, parseJsonBody } from "@/lib/server/http";
import { assertRateLimit, assertTrustedOrigin } from "@/lib/server/security";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  topic: z.enum(["producto", "pedido", "cambios", "marca"]),
  message: z.string().trim().min(10).max(2_000),
  company: z.string().max(0),
});

export async function POST(request: Request): Promise<Response> {
  try {
    assertTrustedOrigin(request);
    assertRateLimit(request, "contact", 5, 15 * 60_000);
    const input = await parseJsonBody(request, contactSchema, 8_192);
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const to = process.env.CONTACT_EMAIL;

    if (!apiKey || !from || !to) {
      if (demoModeAllowed()) {
        return jsonResponse(
          { data: { accepted: true, mode: "demo" } },
          { status: 202 },
        );
      }
      throw new ConfigurationError("El canal de contacto no está configurado.");
    }

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to,
      replyTo: input.email,
      subject: `[PUDU] ${input.topic}: ${input.name}`,
      text: [
        `Nombre: ${input.name}`,
        `Correo: ${input.email}`,
        `Motivo: ${input.topic}`,
        "",
        input.message,
      ].join("\n"),
    });
    if (result.error) {
      throw new ConfigurationError("No fue posible enviar el mensaje.");
    }
    return jsonResponse({ data: { accepted: true } }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
