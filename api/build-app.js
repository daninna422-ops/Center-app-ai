export default async function handler(req, res) {

  // =====================================================
  // CORS
  // =====================================================

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
    "Content-Type, Authorization"
  );


  // =====================================================
  // OPTIONS
  // =====================================================

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }


  // =====================================================
  // ONLY POST
  // =====================================================

  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });

  }


  try {

    // ===================================================
    // BODY
    // ===================================================

    const body = req.body || {};


    const prompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";


    const appName =
      typeof body.appName === "string"
        ? body.appName.trim()
        : "My AI App";


    const language =
      typeof body.language === "string"
        ? body.language
        : "ha";


    const projectId =
      typeof body.projectId === "string"
        ? body.projectId
        : null;


    const apiRequirements =
      Array.isArray(body.apiRequirements)
        ? body.apiRequirements
        : [];


    const extraRequirements =
      typeof body.extraRequirements === "string"
        ? body.extraRequirements.trim()
        : "";


    // ===================================================
    // VALIDATE PROMPT
    // ===================================================

    if (!prompt) {

      return res.status(400).json({
        success: false,
        error:
          "An aika da babu bayanin app."
      });

    }


    // ===================================================
    // API KEY
    // ===================================================

    const apiKey =
      process.env.GEMINI_API_KEY;


    if (!apiKey) {

      console.error(
        "GEMINI_API_KEY is missing."
      );


      return res.status(500).json({

        success: false,

        error:
          "GEMINI_API_KEY ba a saita shi a Vercel Environment Variables ba."

      });

    }


    // ===================================================
    // BUILD ID
    // ===================================================

    const buildId =
      "build_" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .substring(2, 10);


    // ===================================================
    // REQUIREMENTS TEXT
    // ===================================================

    let requirementsText =
      "Babu external API requirement da aka bayar.";


    if (apiRequirements.length > 0) {

      requirementsText =
        apiRequirements
          .map(
            (item, index) =>
              `${index + 1}. ${String(item)}`
          )
          .join("\n");

    }


    // ===================================================
    // AI SYSTEM PROMPT
    // ===================================================

    const systemPrompt = `

You are CENTER APP AI BUILD ENGINE.

You are responsible for generating a complete
mobile-friendly web application from the user's
description.

The application will later be wrapped into Android
using a native web-to-Android build system.

====================================================
USER LANGUAGE
====================================================

Preferred language:

${language === "en" ? "English" : "Hausa"}

If the user writes Hausa, use Hausa UI text.

If the user writes English, use English UI text.

====================================================
APPLICATION
====================================================

Application name:

${appName}

Project ID:

${projectId || "new-project"}

Build ID:

${buildId}

====================================================
USER REQUEST
====================================================

${prompt}

====================================================
EXTRA REQUIREMENTS
====================================================

${extraRequirements || "None"}

====================================================
EXTERNAL API REQUIREMENTS
====================================================

${requirementsText}

====================================================
IMPORTANT BUILD RULES
====================================================

Generate a REAL working frontend.

Do not generate a fake screenshot.

Do not generate Markdown.

Do not return explanations outside JSON.

Return ONLY valid JSON.

The JSON MUST contain:

{
  "appName": "...",
  "description": "...",
  "html": "...",
  "css": "...",
  "js": "...",
  "requirements": [],
  "warnings": [],
  "buildInstructions": [],
  "platform": "android-web"
}

====================================================
HTML
====================================================

The html field must contain ONLY content that belongs
inside <body>.

Do NOT include:

<html>
<head>
<body>

====================================================
CSS
====================================================

Put all application CSS inside css.

The application must:

- work on Android phones
- be responsive
- have a modern UI
- use a clean layout
- have touch-friendly buttons
- have readable text
- avoid horizontal scrolling

====================================================
JAVASCRIPT
====================================================

Put all frontend JavaScript inside js.

Buttons should work.

Navigation should work.

Forms should work where possible.

Use local demo data when a real backend is unavailable.

====================================================
API SECURITY
====================================================

NEVER put secret API keys inside:

HTML
CSS
JavaScript

If the app needs an API key:

1. Create the frontend interface.
2. Mark the API as requiring secure backend integration.
3. Add the requirement to "requirements".
4. Add a warning to "warnings".

Example:

{
  "name": "Gemini API",
  "type": "external-api",
  "required": true,
  "status": "needs-backend"
}

====================================================
BANKING
====================================================

If the user requests banking or financial features
without a real banking API:

Create a DEMO.

Do not pretend real money was transferred.

====================================================
PAYMENTS
====================================================

If payment API is not provided:

Create payment UI as DEMO.

Do not claim that a real payment occurred.

====================================================
LOGIN
====================================================

If login is requested:

Create the login/register interface.

If Firebase/backend credentials are not supplied,
make it a frontend/demo authentication flow.

Add backend authentication to requirements.

====================================================
DATABASE
====================================================

If the application needs a database:

Create the frontend data structure.

Add database/backend requirement.

Do not expose database secrets.

====================================================
AI
====================================================

If the requested application contains AI:

Create the AI interface.

Include:

- chat/input
- loading state
- response area
- error handling

If no AI provider is connected, mark it as DEMO.

====================================================
IMAGE UPLOAD
====================================================

If image upload is required:

Create:

- file picker
- preview
- remove button
- upload UI

Do not pretend the image was uploaded to a server
unless a real storage API exists.

====================================================
APP REQUIREMENTS
====================================================

Detect anything the application needs.

Possible requirements include:

- authentication
- database
- Firebase
- API
- API key
- payment gateway
- maps
- GPS
- notifications
- storage
- image upload
- video API
- AI API
- admin dashboard
- email
- SMS
- OTP
- license
- App ID

Put them inside requirements.

====================================================
BUILD INSTRUCTIONS
====================================================

Return simple build instructions.

Example:

[
  "Prepare web assets",
  "Install Android wrapper",
  "Configure application ID",
  "Build Android APK"
]

====================================================
NO FALSE CLAIMS
====================================================

Do not say:

"APK generated"

unless an actual APK build service generated it.

The current endpoint only prepares the application
for the Android build stage.

====================================================
JSON SAFETY
====================================================

The response MUST be valid JSON.

Escape:

quotes
newlines
backslashes

correctly.

Do not use Markdown code fences.

Return JSON only.

`;


    // ===================================================
    // GEMINI ENDPOINT
    // ===================================================

    const model =
      "gemini-2.5-flash";


    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;


    // ===================================================
    // CALL GEMINI
    // ===================================================

    let response = null;

    let data = null;


    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {

      try {

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

                    responseMimeType:
                      "application/json",

                    temperature:
                      0.2,

                    maxOutputTokens:
                      16000

                  }

                })

            }
          );


      } catch (fetchError) {

        console.error(
          "BUILD GEMINI FETCH ERROR:",
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

          success: false,

          error:
            "An kasa haɗa Build Engine da Gemini."

        });

      }


      data =
        await response
          .json()
          .catch(
            () => ({})
          );


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


    // ===================================================
    // GEMINI ERROR
    // ===================================================

    if (
      !response ||
      !response.ok
    ) {

      console.error(
        "BUILD GEMINI ERROR:",
        JSON.stringify(data)
      );


      if (
        response &&
        response.status === 429
      ) {

        return res.status(429).json({

          success: false,

          error:
            "Gemini quota ya cika. Ka sake gwadawa daga baya."

        });

      }


      return res.status(
        response?.status || 500
      ).json({

        success: false,

        error:
          data?.error?.message ||
          "Gemini API error."

      });

    }


    // ===================================================
    // GET AI TEXT
    // ===================================================

    const text =
      data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;


    if (!text) {

      console.error(
        "EMPTY BUILD RESPONSE:",
        JSON.stringify(data)
      );


      return res.status(500).json({

        success: false,

        error:
          "Build Engine bai dawo da application ba."

      });

    }


    // ===================================================
    // CLEAN JSON
    // ===================================================

    let cleaned =
      text.trim();


    cleaned =
      cleaned
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();


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


    // ===================================================
    // PARSE
    // ===================================================

    let app;


    try {

      app =
        JSON.parse(cleaned);

    } catch (parseError) {

      console.error(
        "BUILD JSON PARSE ERROR:",
        parseError
      );


      console.error(
        "RAW BUILD RESPONSE:",
        text
      );


      return res.status(500).json({

        success: false,

        error:
          "AI ta dawo da JSON mara inganci.",

        details:
          "Build Engine bai dawo da tsarin JSON da ake bukata ba."

      });

    }


    // ===================================================
    // VALIDATE
    // ===================================================

    if (
      !app ||
      typeof app !== "object"
    ) {

      return res.status(500).json({

        success: false,

        error:
          "AI ta dawo da bayanan da ba su dace ba."

      });

    }


    if (
      typeof app.html !== "string"
    ) {

      return res.status(500).json({

        success: false,

        error:
          "Build Engine bai dawo da HTML ba."

      });

    }


    if (
      typeof app.css !== "string"
    ) {

      return res.status(500).json({

        success: false,

        error:
          "Build Engine bai dawo da CSS ba."

      });

    }


    if (
      typeof app.js !== "string"
    ) {

      return res.status(500).json({

        success: false,

        error:
          "Build Engine bai dawo da JavaScript ba."

      });

    }


    // ===================================================
    // NORMALIZE REQUIREMENTS
    // ===================================================

    const requirements =
      Array.isArray(app.requirements)
        ? app.requirements
        : [];


    const warnings =
      Array.isArray(app.warnings)
        ? app.warnings
        : [];


    const buildInstructions =
      Array.isArray(app.buildInstructions)
        ? app.buildInstructions
        : [];


    // ===================================================
    // BUILD STATUS
    // ===================================================

    const buildStatus = {

      buildId:

        buildId,

      projectId:

        projectId,

      status:

        "prepared",

      stage:

        "frontend-generated",

      apkReady:

        false,

      createdAt:

        new Date().toISOString()

    };


    // ===================================================
    // FINAL RESPONSE
    // ===================================================

    return res.status(200).json({

      success: true,

      message:
        "An shirya application domin Android build.",

      build: buildStatus,

      app: {

        name:
          app.appName ||
          appName,

        description:
          app.description ||
          "",

        html:
          app.html,

        css:
          app.css,

        js:
          app.js

      },

      requirements:
        requirements,

      warnings:
        warnings,

      buildInstructions:
        buildInstructions,

      nextStep:
        "Send this build to an Android build server to create the APK."

    });


  } catch (error) {

    console.error(
      "CENTER APP BUILD ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      error:
        error?.message ||
        "An samu matsala yayin shirya application."

    });

  }

}
