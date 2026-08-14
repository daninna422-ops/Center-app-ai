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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Kai ne Center App AI. Ka amsa cikin sauki. " +
                    "Idan mai amfani ya yi Hausa, ka amsa Hausa. " +
                    "Idan Turanci ne, ka amsa Turanci.\n\n" +
                    message
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "Gemini API ya dawo da error."
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        error: "Gemini bai dawo da amsa ba."
      });
    }

    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    return res.status(500).json({
      error: "Server error: " + error.message
    });
  }
}
