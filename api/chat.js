export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "An aika da babu saƙo."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY ba a samu a Vercel ba."
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
                    "Ka amsa cikin sauki. " +
                    "Idan mai amfani ya yi Hausa, ka amsa Hausa. " +
                    "Idan Turanci ne, ka amsa Turanci.\n\n" +
                    message
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512
          }
        })
      }
    );

    const rawText = await response.text();

    let data;

    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({
        error: "Gemini bai dawo da JSON ba: " + rawText
      });
    }

    if (!response.ok) {
  return res.status(response.status).json({
    error:
      data?.error?.message ||
      `Gemini API error: ${response.status}`
  });
}

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return res.status(500).json({
        error:
          data?.promptFeedback?.blockReason ||
          "Gemini bai dawo da amsa ba."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {
    console.error("Center App AI:", error);

    return res.status(500).json({
      error: "Server error: " + (error?.message || "Unknown error")
    });
  }
}
