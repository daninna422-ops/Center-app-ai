export default async function handler(req, res) {

  // ==========================================
  // CORS
  // ==========================================

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


  // ==========================================
  // OPTIONS
  // ==========================================

  if (req.method === "OPTIONS") {
    return res.status(200).json({
      success: true
    });
  }


  // ==========================================
  // METHOD
  // ==========================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    // ==========================================
    // READ BODY SAFELY
    // ==========================================

    let body = req.body || {};

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({
          error: "Request body ba JSON bane."
        });
      }
    }


    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";


    // ==========================================
    // CHECK MESSAGE
    // ==========================================

    if (!message) {
      return res.status(400).json({
        error: "An aika da babu saƙo."
      });
    }


    // ==========================================
    // GEMINI API KEY
    // ==========================================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      console.error(
        "GEMINI_API_KEY is missing"
      );

      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."
      });
    }


    // ==========================================
    // GEMINI MODEL
    // ==========================================

    const model =
      "gemini-3.6-flash";


    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    // ==========================================
    // AI INSTRUCTION
    // ==========================================

    const prompt = `
Kai ne Center App AI.

Ka kasance AI mai taimakon mai amfani wajen tsara
da fahimtar application.

Ka amsa da harshen da mai amfani ya yi amfani da shi.

Idan Hausa ne, ka amsa da Hausa.
Idan Turanci ne, ka amsa da Turanci.

Ka kasance mai sauƙin fahimta.

Idan mai amfani yana magana game da ƙirƙirar app,
ka taimaka masa wajen tattara requirements kamar:

- Sunan app
- Nau'in app
- Masu amfani
- Features
- Login
- Phone number
- OTP
- Database
- Payment
- API
- Notifications
- Location
- Admin dashboard
- User dashboard
- Logo
- Images
- Sauran requirements

Kada ka yi iƙirarin cewa an gina APK
idan ba a yi build ba.

Kada ka nemi secret API key a cikin chat.

Ga saƙon mai amfani:

${message}
`;


    // ==========================================
    // CALL GEMINI
    // ==========================================

    let response;
    let data;

    try {

      response = await fetch(
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
                    text: prompt
                  }
                ]
              }
            ]

          })
        }
      );

    } catch (fetchError) {

      console.error(
        "GEMINI FETCH ERROR:",
        fetchError
      );

      return res.status(502).json({
        error:
          "Ba a iya haɗuwa da Gemini API ba.",
        details:
          fetchError?.message ||
          "Network error"
      });
    }


    // ==========================================
    // READ GEMINI RESPONSE
    // ==========================================

    const rawText =
      await response.text();


    try {

      data =
        rawText
          ? JSON.parse(rawText)
          : {};

    } catch (parseError) {

      console.error(
        "GEMINI RETURNED NON-JSON:",
        rawText
      );

      return res.status(502).json({
        error:
          "Gemini API ta dawo da bayanan da ba JSON ba.",
        details:
          rawText.substring(0, 500)
      });
    }


    // ==========================================
    // GEMINI ERROR
    // ==========================================

    if (!response.ok) {

      console.error(
        "GEMINI API ERROR:",
        JSON.stringify(data)
      );


      const geminiMessage =
        data?.error?.message ||
        "Gemini API error";


      if (response.status === 401) {

        return res.status(401).json({
          error:
            "Gemini API key ba daidai ba ne ko ya ƙare.",
          details:
            geminiMessage
        });

      }


      if (response.status === 403) {

        return res.status(403).json({
          error:
            "Gemini API key ba shi da permission ko an hana wannan request.",
          details:
            geminiMessage
        });

      }


      if (response.status === 429) {

        return res.status(429).json({
          error:
            "Gemini quota ya cika ko an yi requests da yawa. Ka sake gwadawa daga baya.",
          details:
            geminiMessage
        });

      }


      return res.status(
        response.status >= 400 &&
        response.status < 600
          ? response.status
          : 500
      ).json({

        error:
          geminiMessage

      });
    }


    // ==========================================
    // GET AI TEXT
    // ==========================================

    const reply =
      data
        ?.candidates?.[0]
        ?.content?.parts
        ?.map(part => part?.text || "")
        ?.join("")
        ?.trim();


    // ==========================================
    // EMPTY RESPONSE
    // ==========================================

    if (!reply) {

      console.error(
        "EMPTY GEMINI RESPONSE:",
        JSON.stringify(data)
      );

      return res.status(500).json({
        error:
          "Gemini bai dawo da amsa ba."
      });
    }


    // ==========================================
    // SUCCESS
    // ==========================================

    return res.status(200).json({

      success: true,

      reply: reply

    });


  } catch (error) {

    // ==========================================
    // SERVER ERROR
    // ==========================================

    console.error(
      "CENTER APP CHAT ERROR:",
      error
    );


    return res.status(500).json({

      error:
        "An samu matsala a backend. Ka sake gwadawa.",

      details:
        error?.message ||
        "Unknown server error"

    });

  }

}
