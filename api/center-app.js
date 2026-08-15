export default async function handler(req, res) {

  // =========================
  // CORS
  // =========================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );


  // =========================
  // OPTIONS
  // =========================

  if (req.method === "OPTIONS") {

    return res.status(200).end();

  }


  // =========================
  // METHOD
  // =========================

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    // =========================
    // GET PROMPT
    // =========================

    const body =
      req.body || {};

    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";


    if (!prompt) {

      return res.status(400).json({
        error:
          "An aika da babu bayanin app."
      });

    }


    // =========================
    // API KEY
    // =========================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."
      });

    }


    // =========================
    // AI PROMPT
    // =========================

    const systemPrompt = `
You are Center App AI.

You are an expert AI web application builder.

The user will describe an application they want to build.

Your job is to generate a complete frontend application based on the user's request.

The user may write in Hausa or English.

IMPORTANT:

Return ONLY valid JSON.

Do NOT return Markdown.

Do NOT use code fences.

Do NOT write explanations before or after the JSON.

The JSON must contain EXACTLY these fields:

{
  "html": "...",
  "css": "...",
  "js": "..."
}

RULES:

1. "html" must contain ONLY the content that belongs inside the HTML body.

2. Do NOT put:
<html>
<head>
<body>
inside the html field.

3. The "css" field must contain all CSS required by the application.

4. The "js" field must contain all client-side JavaScript required by the application.

5. The application must be responsive on Android phones.

6. The application must have a modern and professional design.

7. Buttons, forms, navigation and other interactive elements should work where possible.

8. Do not use external libraries unless absolutely necessary.

9. Do not invent real banking transactions.

10. If the user asks for a banking application and no real banking API is provided, create a DEMO frontend only.

11. If the application requires a backend, database, authentication, payment system, AI API, video generation API or another external API that has not been provided, create a frontend DEMO for that functionality.

12. Do not put API keys inside HTML, CSS or JavaScript.

13. If the user asks for an AI application, design the interface so it can later be connected to a real AI API.

14. If the user asks for a video-generation application, create the frontend interface for a video-generation app. Include suitable controls such as:
   - video prompt
   - aspect ratio
   - duration
   - generation button
   - loading state
   - preview area
   - projects/history area when appropriate

15. Do NOT pretend that a video was actually generated if no video-generation API is connected.

16. If the requested feature needs a real external API, clearly make it a DEMO in the frontend.

17. Use Hausa interface text when the user communicates in Hausa.

18. Keep the generated application self-contained.

19. Make sure all quotation marks, newlines and special characters are escaped correctly so the response remains valid JSON.

20. The final response MUST be parseable using JSON.parse().

USER REQUEST:

${prompt}

Generate the complete frontend application now.
`;


    // =========================
    // GEMINI API
    // =========================

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";


    const response =
      await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-goog-api-key":
              apiKey
          },

          body: JSON.stringify({

            contents: [
              {
                role: "user",

                parts: [
                  {
                    text:
                      systemPrompt
                  }
                ]
              }
            ],

            generationConfig: {

              responseMimeType:
                "application/json",

              temperature:
                0.2,

              maxOutputTokens:
                12000

            }

          })
        }
      );


    // =========================
    // GEMINI RESPONSE
    // =========================

    const data =
      await response.json();


    if (!response.ok) {

      console.error(
        "GEMINI ERROR:",
        JSON.stringify(data)
      );


      return res.status(
        response.status
      ).json({

        error:
          data?.error?.message ||
          "Gemini API error"

      });

    }


    // =========================
    // GET TEXT
    // =========================

    const text =
      data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;


    if (!text) {

      console.error(
        "EMPTY GEMINI RESPONSE:",
        JSON.stringify(data)
      );


      return res.status(500).json({

        error:
          "Gemini bai dawo da application code ba."

      });

    }


    // =========================
    // CLEAN JSON
    // =========================

    let cleaned =
      text.trim();


    // Remove markdown code fences
    cleaned =
      cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();


    // Find JSON object if AI added extra text
    const firstBrace =
      cleaned.indexOf("{");

    const lastBrace =
      cleaned.lastIndexOf("}");


    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );

    }


    // =========================
    // PARSE JSON
    // =========================

    let app;


    try {

      app =
        JSON.parse(cleaned);

    } catch (parseError) {

      console.error(
        "JSON PARSE ERROR:",
        parseError
      );

      console.error(
        "RAW AI RESPONSE:",
        text
      );


      return res.status(500).json({

        error:
          "AI ta dawo da JSON mara inganci.",

        details:
          "Gemini bai dawo da tsarin JSON da ake bukata ba."

      });

    }


    // =========================
    // VALIDATE
    // =========================

    if (
      !app ||
      typeof app !== "object"
    ) {

      return res.status(500).json({

        error:
          "AI ta dawo da bayanan da ba su dace ba."

      });

    }


    if (
      typeof app.html !== "string"
    ) {

      return res.status(500).json({

        error:
          "AI bai dawo da HTML ba."

      });

    }


    if (
      typeof app.css !== "string"
    ) {

      return res.status(500).json({

        error:
          "AI bai dawo da CSS ba."

      });

    }


    if (
      typeof app.js !== "string"
    ) {

      return res.status(500).json({

        error:
          "AI bai dawo da JavaScript ba."

      });

    }


    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      html:
        app.html,

      css:
        app.css,

      js:
        app.js

    });


  } catch (error) {

    console.error(
      "CREATE APP ERROR:",
      error
    );


    return res.status(500).json({

      error:
        error?.message ||
        "An samu matsala a server."

    });

  }

}
