export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Rubuta saƙo tukuna."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY ba a saita a Vercel ba."
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    "Kai ne Center App AI. " +
                    "Ka amsa cikin sauki da Hausa idan mai amfani ya yi Hausa. " +
                    "Idan ya yi Turanci, ka amsa Turanci.\n\n" +
                    message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini API ya dawo da kuskure."
      });
    }

    let reply = "";

    if (data?.candidates?.length) {
      for (const candidate of data.candidates) {
        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part?.text) {
              reply += part.text;
            }
          }
        }
      }
    }

    reply = reply.trim();

    if (!reply) {
      return res.status(200).json({
        reply: "Na karɓi saƙonka, amma Gemini bai samar da rubutu ba."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Center App AI Error:", error);

    return res.status(500).json({
      error: error?.message || "Server error"
    });
  }
}
