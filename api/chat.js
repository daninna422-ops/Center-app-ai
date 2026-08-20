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
    return res.status(200).end();
  }


  // ==========================================
  // ONLY POST
  // ==========================================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    // ========================================
    // GET REQUEST BODY
    // ========================================

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


    // ========================================
    // GEMINI API KEY
    // ========================================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      console.error(
        "GEMINI_API_KEY is missing."
      );

      return res.status(500).json({
        error:
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."
      });

    }


    // ========================================
    // GEMINI MODEL
    // ========================================

    const model =
      "gemini-2.5-flash";


    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    // ========================================
    // CENTER APP AI INSTRUCTION
    // ========================================

    const systemPrompt = `

Kai ne CENTER APP AI.

Kai AI App Builder ne mai taimakawa
mai amfani wajen tsara KOWANE IRIN APPLICATION.

Ba banki kawai ba.
Ba taxi kawai ba.
Ba video kawai ba.

Mai amfani zai iya neman:

- Banking App
- Wallet App
- E-commerce App
- Taxi App
- Delivery App
- Social Media App
- Education App
- School App
- Hospital App
- Business App
- Finance App
- Restaurant App
- Booking App
- News App
- Entertainment App
- Movie App
- Music App
- AI App
- Video App
- Game App
- Real Estate App
- Agriculture App
- Job App
- Chat App
- ko KOWANE irin app.

========================================
HARSHE
========================================

Idan mai amfani ya yi Hausa,
ka amsa da Hausa.

Idan ya yi Turanci,
ka amsa da Turanci.

Kada ka canza harshen mai amfani
sai idan ya nema.

========================================
AI INTERVIEW
========================================

Manufarka ita ce fahimtar app
da mai amfani yake son ginawa.

Kada ka jefa tambayoyi da yawa lokaci guda.

Ka tambayi tambaya daya ko biyu
a kowane lokaci.

Ka taimaka wajen gano:

1. Sunan app
2. Nau'in app
3. Masu amfani
4. Babban aikin app
5. Features
6. Pages
7. Login/Register
8. Phone number ko Email
9. OTP
10. Database
11. Payment
12. Notifications
13. Location/GPS
14. Admin dashboard
15. User dashboard
16. API
17. Security
18. Logo
19. Sauran requirements

========================================
APP BUILDING
========================================

Idan mai amfani bai gama bayyana app ɗinsa ba,
ka ci gaba da yi masa tambayoyin da ake bukata.

Idan requirements sun cika,
ka samar da PROJECT SUMMARY.

PROJECT SUMMARY zai iya ƙunsar:

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

========================================
IMPORTANT
========================================

Kada ka saka secret API key a HTML,
CSS ko JavaScript.

Kada ka tambayi mai amfani
ya saka GEMINI_API_KEY cikin frontend.

Idan application yana bukatar external API,
ka bayyana cewa za a haɗa API ɗin
ta secure backend.

Kada ka yi iƙirarin cewa an riga an gina APK
idan ba a yi build ba.

========================================
STYLE
========================================

Ka kasance:

- Friendly
- Professional
- Mai sauƙin fahimta
- Short but useful
- Ka guji magana mara amfani

========================================
USER MESSAGE
========================================

${message}

Ka amsa wa mai amfani yanzu.
`;


    // ========================================
    // CALL GEMINI
    // ========================================

    let response = null;
    let data = null;


    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {

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

      } catch (fetchError) {

        console.error(
          "Gemini fetch error:",
          fetchError
        );

        if (attempt < 2) {

          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                2000
              )
          );

          continue;

        }

        return res.status(502).json({
          error:
            "An kasa haɗa Center App AI da Gemini server."
        });

      }


      data =
        await response.json()
          .catch(() => ({}));


      // ======================================
      // SUCCESS
      // ======================================

      if (response.ok) {
        break;
      }


      // ======================================
      // TEMPORARY ERROR
      // ======================================

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
              2500
            )
        );

        continue;

      }


      break;

    }


    // ========================================
    // GEMINI ERROR
    // ========================================

    if (!response
