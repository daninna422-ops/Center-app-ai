export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    // Check message
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "An aika da babu saƙo."
      });
    }

    // Get Gemini API key from Vercel Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."
      });
    }

    // Current Gemini model
    const model = "gemini-3.6-flash";

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Instruction for Center App AI
    const prompt = `
Kai ne Center App AI.

Ka amsa wa mai amfani cikin harshen da ya yi amfani da shi.

Idan ya yi Hausa, ka amsa da Hausa.
Idan ya yi Turanci, ka amsa da Turanci.

Ka kasance mai taimako, mai sauƙin fahimta, kuma kada ka ƙara bayanan da ba a nema ba.

Mai amfani ya ce:

${message}
`;

    // Try up to 2 times for temporary server overload
    let response;
    let data;

    for (let attempt = 1; attempt <= 2; attempt++) {
      response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      data = await response.json().catch(() => ({}));

      // Success
      if (response.ok) {
        break;
      }

      // Retry only temporary errors
      if (
        (response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504) &&
        attempt < 2
      ) {
        await new Promise(resolve =>
          setTimeout(resolve, 2500)
        );

        continue;
      }

      break;
    }

    // Gemini returned an error
    if (!response.ok) {
      const geminiError =
        data?.error?.message ||
        "Gemini API ya dawo da kuskure.";

      // Quota / rate limit
      if (response.status === 429) {
        return res.status(429).json({
          error:
            "Gemini quota ya cika ko an samu yawan requests. Ka sake gwadawa daga baya."
        });
      }

      // Temporary overload
      if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        return res.status(503).json({
          error:
            "Gemini yana cikin cunkoso a yanzu. Ka sake gwadawa bayan ɗan lokaci."
        });
      }

      return res.status(response.status).json({
        error: geminiError
      });
    }

    // Get AI response
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        error:
          "Gemini bai dawo da amsa ba."
      });
    }

    // Send reply to chat.html / creator.html
    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Center App AI error:", error);

    return res.status(500).json({
      error:
        "An samu matsala a backend. Ka sake gwadawa."
    });
  }
}
