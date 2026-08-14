
export default async function handler(req, res) {
  // Only allow POST requests
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
        error: "GEMINI_API_KEY ba a samu a Vercel ba."
      });
    }

    // Call Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text:
                  "Kai ne Center App AI. " +
                  "Ka kasance mai taimako da ladabi. " +
                  "Idan mai amfani ya yi Hausa, ka amsa da Hausa. " +
                  "Idan ya yi Turanci, ka amsa da Turanci. " +
                  "Ka yi bayani cikin sauki kuma a sarari."
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message
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

    // Gemini returned an error
    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "Gemini API ya dawo da kuskure."
      });
    }

    // Get AI response
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return res.status(500).json({
        error: "Gemini bai dawo da amsa ba."
      });
    }

    // Send response back to chat.html
    return res.status(200).json({
      reply: reply
    });

  } catch (error) {
    console.error("Center App AI error:", error);

    return res.status(500).json({
      error: "Server error: " + (error?.message || "Unknown error")
    });
  }
}
