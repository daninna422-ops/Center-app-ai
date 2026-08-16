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
    // GET MESSAGE
    // =========================

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
    // GEMINI MODEL
    // =========================

    const model =
      "gemini-3.6-flash";

    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    // =========================
    // AI INSTRUCTION
    // =========================

    const prompt = `
Kai ne Creator App AI.

Aikinka shi ne taimaka wa mai amfani tsara application.

Ka amsa da harshen da mai amfani ya yi amfani da shi.

Idan Hausa ne, ka yi Hausa.
Idan Turanci ne, ka yi Turanci.

Ka kasance mai sauƙin fahimta.

MUHIMMIN ABU:

Mai amfani yana son gina application.

Ka fara da fahimtar application ɗin.

Idan bai bayyana sunan app ba,
ka tambaye shi sunan app.

Idan bai bayyana babban aikin app ba,
ka tambaye shi.

Ka tambayi requirements a hankali,
ba sai ka yi tambayoyi masu yawa lokaci guda ba.

Idan app ɗin banking ne,
ka tambayi abubuwa kamar:

- Sunan bankin/app
- Login
- Phone number
- OTP
- Balance
- Deposit
- Withdraw
- Transfer
- Transaction history
- Profile
- Notifications
- Admin dashboard
- Database
- Payment/API

Idan app ɗin taxi ne,
ka tambayi:

- Rider
- Driver
- Location
- GPS
- Booking
- Fare
- Payment
- Trip history

Idan app ɗin e-commerce ne,
ka tambayi:

- Products
- Cart
- Checkout
- Payment
- Orders
- Users
- Admin

Kada ka ƙirƙiri real transaction.

Idan babu real API,
ka bayyana cewa DEMO ne.

Kada ka nemi secret API key a chat.

Kada ka yi iƙirarin cewa APK ya riga ya kasance
idan ba a yi build ba.

A yanzu muna bin wannan tsarin:

REQUIREMENTS
→ APP PLAN
→ APP BUILDER
→ PREVIEW
→ BUILD

USER MESSAGE:

${message}
`;

    // =========================
    // REQUEST GEMINI
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
                    text: prompt
                  }
                ]
              }
            ]

          })
        }
      );

      const raw =
        await response.text();

      try {
        data =
          raw
            ? JSON.parse(raw)
            : {};
      } catch (e) {

        console.error(
          "Gemini returned non JSON:",
          raw
        );

        data = {
          error: {
            message:
              raw ||
              "Gemini ya dawo da response mara kyau."
          }
        };
      }

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
    // GEMINI ERROR
    // =========================

    if (!response || !response.ok) {

      console.error(
        "GEMINI ERROR:",
        JSON.stringify(data)
      );

      const errorMessage =
        data?.error?.message ||
        "Gemini API error.";

      return res.status(
        response?.status || 500
      ).json({
        error: errorMessage
      });
    }

    // =========================
    // GET AI REPLY
    // =========================

    const reply =
      data
        ?.candidates?.[0]
        ?.content
        ?.parts?.[0]
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
      reply: reply.trim()
    });

  } catch (error) {

    console.error(
      "CHAT SERVER ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "An samu matsala a backend."
    });
  }
}
