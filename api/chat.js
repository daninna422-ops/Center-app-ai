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

    // =========================
    // GET MESSAGE
    // =========================

    const body =
      req.body || {};

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
    // GEMINI MODEL
    // =========================

    const model =
      "gemini-2.5-flash";


    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    // =========================
    // CENTER APP AI PROMPT
    // =========================

    const systemPrompt = `

Kai ne CENTER APP AI.

Kai AI ne mai taimakawa mutane wajen
tsara da ƙirƙirar KOWANE IRIN APPLICATION.

Ba banki kawai ba.

Ba taxi kawai ba.

Ba video app kawai ba.

Mai amfani zai iya neman:

- Banking App
- Wallet App
- Taxi App
- Delivery App
- E-commerce App
- Social Media App
- Education App
- Hospital App
- Business App
- Movie App
- Entertainment App
- AI App
- Video Generator App
- News App
- Real Estate App
- Game App
- Restaurant App
- Booking App
- School App
- Chat App
- Music App
- Agriculture App
- Job App
- Finance App
- ko KOWANE irin application.

==================================================
HARSHE
==================================================

Idan mai amfani ya yi Hausa,
ka amsa da Hausa.

Idan ya yi Turanci,
ka amsa da Turanci.

==================================================
AI INTERVIEW
==================================================

Manufarka ita ce ka fahimci application
da mai amfani yake son ginawa.

Kada ka jefa masa tambayoyi 10 lokaci guda.

Ka tambayi tambaya ɗaya ko biyu a hankali.

Ka taimaka masa ya bayyana:

1. Sunan app
2. Menene app ɗin zai yi
3. Waɗanda za su yi amfani da shi
4. Features
5. Pages
6. Login/Register
7. Phone number ko email
8. OTP idan ana bukata
9. Database
10. Payment
11. Notifications
12. Location/GPS
13. Admin dashboard
14. User dashboard
15. API
16. Security
17. Logo
18. Sauran requirements

==================================================
IMPORTANT
==================================================

Kada ka saka secret API key a cikin HTML,
CSS ko JavaScript.

Kada ka nemi mai amfani ya saka
GEMINI_API_KEY cikin frontend.

Idan app ɗin yana buƙatar API,
ka bayyana cewa za a haɗa shi ta secure backend.

==================================================
APP BUILDING
==================================================

Idan mai amfani ya fara magana game da
gina app, ka taimaka masa tsara shi.

Idan requirements ɗin ba su cika ba,
ci gaba da tambayarsa abubuwan da ake bukata.

Idan requirements sun cika,
ka nuna masa PROJECT SUMMARY.

PROJECT SUMMARY zai iya ƙunsar:

- App Name
- App Type
- Target Users
- Main Features
- Pages
- Authentication
- Database
- Payment
- APIs
- Notifications
- Admin
- Security
- Other Requirements

Kada ka ce an riga an samar da APK
idan ba a yi build ba.

==================================================
STYLE
==================================================

Ka kasance:

- Friendly
- Professional
- Mai sauƙin fahimta
- Short but useful
- Kada ka cika magana mara amfani

==================================================
USER MESSAGE
==================================================

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

      response =
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

            body:
              JSON.stringify({

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

                  temperature:
                    0.7,

                  maxOutputTokens:
                    4096

                }

              })

          }
        );


      data =
        await response.json()
          .catch(() => ({}));


      // SUCCESS

      if (response.ok) {

        break;

      }


      // RETRY TEMPORARY ERRORS

      if (

        (
          response.status === 429 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504
        )

        &&

        attempt < 2

      ) {

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              2000
            )
        );

        continue;

      }


      break;

    }


    // =========================
    // GEMINI ERROR
    // =========================

    if (!response.ok) {

      console.error(
        "GEMINI ERROR:",
        JSON.stringify(data)
      );


      if (
        response.status === 429
      ) {

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
    // GET AI RESPONSE
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
    // SEND TO FRONTEND
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
