import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Sadece POST isteği kabul edilir."
    });
  }

  try {
    const { message, previous_response_id } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Mesaj bulunamadı."
      });
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        error: "Boş mesaj gönderilemez."
      });
    }

    if (cleanMessage.length > 2000) {
      return res.status(400).json({
        error: "Mesaj 2000 karakterden uzun olamaz."
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",

      instructions: `
Sen J.A.R.V.I.S. adlı yapay zeka asistanısın.

Kullanıcıyla Türkçe konuş.
Sakin, profesyonel, doğal ve yardımcı ol.
Gereksiz yere uzun cevaplar verme.
Soruları doğrudan cevapla.
Kullanıcı sana J.A.R.V.I.S. olarak hitap edebilir.
`,

      ...(previous_response_id
        ? {
            previous_response_id: previous_response_id
          }
        : {}),

      input: cleanMessage,

      max_output_tokens: 600
    });

    return res.status(200).json({
      reply: response.output_text || "Yanıt oluşturulamadı.",
      response_id: response.id
    });

  } catch (error) {
    console.error("OpenAI Error:", error);

    return res.status(500).json({
      error: "J.A.R.V.I.S. şu anda yanıt veremiyor."
    });
  }
}
