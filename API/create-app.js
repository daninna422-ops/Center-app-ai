export default async function handler(req, res) {

  /* =========================
     METHOD
  ========================= */

  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  try {

    /* =========================
       GET USER PROMPT
    ========================= */

    const { prompt } =
      req.body || {};


    if (!prompt) {

      return res.status(400).json({
        error: "An aika da babu bayanin app."
      });

    }


    /* =========================
       GEMINI API KEY
    ========================= */

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel ba."
      });

    }


    /* =========================
       AI INSTRUCTION
    ========================= */

    const systemPrompt = `

You are Center App AI, an expert AI web app builder.

Your job is to create a complete working frontend application from the user's description.

The user may write in Hausa or English.

Return ONLY valid JSON.

The JSON MUST have exactly these three fields:

{
  "html": "...",
  "css": "...",
  "js": "..."
}

Rules:

1. HTML must contain only the page body content.
2. Do not include <html>, <head>, or <body> tags in html.
3. CSS must contain all required styling.
4. JavaScript must contain all required client-side functionality.
5. Make the application responsive for Android phones.
6. Make the design modern and professional.
7. Use buttons, forms, navigation and cards when appropriate.
8. Do not use external libraries unless absolutely necessary.
9. Do not use markdown code fences.
10. Do not write explanations outside the JSON.
11. Make the generated application actually work in the browser.
12. If the user asks for a banking app, create a DEMO frontend only unless real banking APIs are provided.
13. Never invent real payment or banking transactions.
14. If the requested app needs a backend/API that has not been provided, create a frontend demo and clearly represent backend-dependent actions as demo functionality.
15. Use Hausa text when the user's request is in Hausa.
16. Escape JSON correctly.

User's app request:

${prompt}

Now generate the application.
`;


    /* =========================
       GEMINI REQUEST
    ========================= */

    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
                    text: systemPrompt
                  }
                ]
              }
            ],

            generationConfig: {

              responseMimeType:
                "application/json",

              maxOutputTokens:
                12000

            }

          })
        }
      );


    /* =========================
       GEMINI RESPONSE
    ========================= */

    const data =
      await response.json();


    if (!response.ok) {

      return res.status(
        response.status
      ).json({

        error:
          data?.error?.message ||
          "Gemini API error"

      });

    }


    const text =
      data?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;


    if (!text) {

      return res.status(500).json({

        error:
          "Gemini bai dawo da code ba."

      });

    }


    /* =========================
       PARSE JSON
    ========================= */

    let app;


    try {

      app =
        JSON.parse(text);

    } catch (parseError) {

      /*
       * Sometimes AI may return
       * JSON inside markdown.
       */

      const cleaned =
        text
          .replace(/^```json/i, "")
          .replace(/^```/i, "")
          .replace(/```$/i, "")
          .trim();


      try {

        app =
          JSON.parse(cleaned);

      } catch (secondError) {

        return res.status(500).json({

          error:
            "AI ta dawo da JSON mara inganci."

        });

      }

    }


    /* =========================
       VALIDATE FILES
    ========================= */

    if (
      typeof app.html !== "string" ||
      typeof app.css !== "string" ||
      typeof app.js !== "string"
    ) {

      return res.status(500).json({

        error:
          "Generated app bai ƙunshi HTML, CSS da JS daidai ba."

      });

    }


    /* =========================
       SUCCESS
    ========================= */

    return res.status(200).json({

      html: app.html,

      css: app.css,

      js: app.js

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
