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
  // ONLY POST
  // =========================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    const body = req.body || {};

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";


    if (!message) {
      return res.status(400).json({
        error: "An aika da babu saƙo."
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
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."
      });
    }


    // =========================
    // MODEL
    // =========================

    const model =
      "gemini-2.5-flash";


    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    // =========================
    // CENTER APP AI
    // =========================

    const systemPrompt = `

Kai ne CENTER APP AI.

Kai babban AI App Builder ne.

Aikinka shi ne taimaka wa mai amfani
ya tsara KOWANE IRIN APPLICATION.

Ba banki kawai ba.
Ba taxi kawai ba.
Ba video kawai ba.

Mai amfani zai iya son:

Banking
Wallet
Taxi
Delivery
E-commerce
Social Media
Education
Hospital
Business
Movie
Entertainment
AI
Video
News
Real Estate
Game
Restaurant
Booking
School
Chat
Music
Agriculture
Job
Finance
ko KOWANE irin application.

========================================
HARSHE
========================================

Idan mai amfani ya yi Hausa,
ka amsa da Hausa.

Idan ya yi Turanci,
ka amsa da Turanci.

========================================
AI INTERVIEW
========================================

Ka taimaka wa mai amfani ya bayyana app ɗinsa.

Kada ka tambayi abubuwa da yawa lokaci guda.

Ka fara da tambaya ɗaya ko biyu.

Ka taimaka wajen gano:

- Sunan app
- Nau'in app
- Masu amfani
- Babban aikin app
- Features
- Pages
- Login/Register
- Email ko Phone
- OTP
- Database
- Payment
- Notifications
- Location/GPS
- Admin dashboard
- User dashboard
- API
- Security
- Logo
- Sauran requirements

========================================
APP BUILDING
========================================

Idan requirements ba su cika ba,
ka ci gaba da tambayar mai amfani
abubuwan da ake bukata.

Idan requirements sun cika,
ka nuna PROJECT SUMMARY.

Project Summary zai iya ƙunsar:

App Name
App Type
Target Users
Main Features
Pages
Authentication
Database
Payment
APIs
Notifications
Admin
Security
Other Requirements

Kada ka yi iƙirarin cewa an gina APK
idan ba a yi build ba.

========================================
SECURITY
========================================

Kada ka saka secret API key a frontend.

Kada ka nemi GEMINI_API_KEY
a cikin HTML ko JavaScript.

Idan app yana bukatar API,
ka bayyana cewa za a haɗa shi
ta secure backend.

========================================
STYLE
========================================

Ka kasance friendly,
professional,
mai sauƙin fahimta.

Kada ka cika magana mara amfani.

========================================
CURRENT USER MESSAGE
========================================

${message}

Ka amsa wa mai amfani yanzu.
`;


    // =========================
    // CALL GEMINI
    // =========================

    let response;
    let data;


    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {

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
                    text:
                      systemPrompt
                  }
                ]
              }

            ],

            generationConfig: {

              temperature: 0.7,

              maxOutputTokens: 4096

            }

          })
        }
      );


      data =
        await response.json()
          .catch(() => ({}));


      if (response.ok) {
        break;
      }


      if (
        (
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        ) &&
        attempt < 2
      ) {

        await new Promise(
          resolve =>
            setTimeout(resolve, 2000)
        );

        continue;
      }

      break;
    }


    // =========================
    // ERROR
    // =========================

    if (!response.ok) {

      console.error(
        "GEMINI ERROR:",
        JSON.stringify(data)
      );


      if (response.status === 429) {

        return res.status(429).json({
          error:
            "Gemini quota ya cika. Ka sake gwadawa daga baya."
        });

      }


      if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {

        return res.status(503).json({
          error:
            "Gemini yana cikin cunkoso yanzu. Ka sake gwadawa bayan ɗan lokaci."
        });

      }


      return res.status(
        response.status
      ).json({

        error:
          data?.error?.message ||
          "Gemini API error."

      });

    }


    // =========================
    // GET REPLY
    // =========================

    const reply =
      data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;


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


    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({

      reply:
        reply.trim()

    });


  } catch (error) {

    console.error(
      "CENTER APP AI ERROR:",
      error
    );


    return res.status(500).json({

      error:
        error?.message ||
        "An samu matsala a server."

    });

  }

}
