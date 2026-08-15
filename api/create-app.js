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
    // USER PROMPT
    // =========================

    const prompt =
      typeof req.body?.prompt === "string"
        ? req.body.prompt.trim()
        : "";


    if (!prompt) {

      return res.status(400).json({
        error:
          "An aika da babu bayanin app."
      });

    }


    // =========================
    // GEMINI API KEY
    // =========================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel ba."
      });

    }


    // =========================
    // SYSTEM PROMPT
    // =========================

    const systemPrompt = `
Kai ne Center App AI.

Kai ƙwararren AI ne wajen ƙirƙirar frontend web applications.

Mai amfani zai bayyana irin application ɗin da yake son ginawa.

Mai amfani zai iya amfani da Hausa ko English.

Ka ƙirƙiri cikakken frontend application bisa bayaninsa.

APPLICATION REQUEST:

${prompt}

MUHIMMAN KA'IDOJI:

1. HTML:
   - Dawo da body content kawai.
   - Kada ka saka <html>, <head>, ko <body>.

2. CSS:
   - Saka duk styling da application yake bukata.

3. JavaScript:
   - Saka duk functionality da application yake bukata.

4. Application ya zama:
   - Modern
   - Professional
   - Responsive ga Android
   - Mai sauƙin amfani

5. Buttons da forms su yi aiki idan zai yiwu.

6. Idan application yana buƙatar backend,
   database, authentication, payment, AI API,
   video API ko wani external API wanda ba a bayar ba,
   ƙirƙiri DEMO frontend kawai.

7. Kada ka saka API key a frontend.

8. Idan mai amfani ya nemi AI video generator,
   ƙirƙiri interface mai:
   - Prompt input
   - Generate button
   - Loading state
   - Video preview area
   - Aspect ratio
   - Duration
   - History/projects idan ya dace

9. Kada ka yi ƙarya cewa an ƙirƙiri real video
   idan babu real video-generation API.

10. Idan mai amfani ya yi Hausa,
    yi amfani da Hausa a interface.

11. Kada ka dawo da markdown.

12. Kada ka dawo da bayani a wajen JSON.

13. Dole ne response ya dace da JSON Schema da aka bayar.
`;


    // =========================
    // JSON SCHEMA
    // =========================

    const responseSchema = {

      type: "object",

      properties: {

        html: {
          type: "string",
          description:
            "HTML body content only. Do not include html, head, or body tags."
        },

        css: {
          type: "string",
          description:
            "Complete CSS required by the application."
        },

        js: {
          type: "string",
          description:
            "Complete client-side JavaScript required by the application."
        }

      },

      required: [
        "html",
        "css",
        "js"
      ]

    };


    // =========================
    // GEMINI REQUEST
    // =========================

    const response =
      await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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

              responseJsonSchema:
                responseSchema,

              temperature:
                0.2,

              maxOutputTokens:
                16000

            }

          })

        }
      );


    // =========================
    // READ GEMINI RESPONSE
    // =========================

    const data =
      await response.json();


    // =========================
    // GEMINI ERROR
    // =========================

    if (!response.ok) {

      console.error(
        "GEMINI API ERROR:",
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
    // GET GENERATED TEXT
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
    // PARSE JSON
    // =========================

    let app;


    try {

      app =
        JSON.parse(
          text.trim()
        );

    } catch (error) {

      console.error(
        "JSON PARSE ERROR:",
        error
      );

      console.error(
        "RAW GEMINI RESPONSE:",
        text
      );


      return res.status(500).json({

        error:
          "AI ta dawo da JSON mara inganci.",

        details:
          "An samu response daga Gemini amma bai dace da JSON format ba."

      });

    }


    // =========================
    // VALIDATE
    // =========================

    if (
      typeof app !== "object" ||
      app === null
    ) {

      return res.status(500).json({

        error:
          "AI ta dawo da bayanan da ba su dace ba."

      });

    }


    if (
      typeof app.html !== "string" ||
      typeof app.css !== "string" ||
      typeof app.js !== "string"
    ) {

      return res.status(500).json({

        error:
          "AI bai dawo da HTML, CSS da JavaScript guda uku ba."

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
