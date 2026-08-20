export default async function handler(req, res) {

  // ==============================
  // CORS
  // ==============================

  res.setHeader("Access-Control-Allow-Origin", "*");
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

  // ==============================
  // METHOD
  // ==============================

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    // ==============================
    // GET DATA
    // ==============================

    const body = req.body || {};

    const html =
      typeof body.html === "string"
        ? body.html
        : "";

    const css =
      typeof body.css === "string"
        ? body.css
        : "";

    const js =
      typeof body.js === "string"
        ? body.js
        : "";

    const appName =
      typeof body.appName === "string"
        ? body.appName.trim()
        : "My App";


    // ==============================
    // CHECK
    // ==============================

    if (!html) {
      return res.status(400).json({
        error: "HTML bai zo ba."
      });
    }

    if (!css) {
      return res.status(400).json({
        error: "CSS bai zo ba."
      });
    }

    if (!js) {
      return res.status(400).json({
        error: "JavaScript bai zo ba."
      });
    }


    // ==============================
    // CREATE COMPLETE HTML APP
    // ==============================

    const completeHTML = `<!DOCTYPE html>
<html lang="ha">
<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<meta
  name="theme-color"
  content="#1261d6"
>

<meta
  name="mobile-web-app-capable"
  content="yes"
>

<meta
  name="apple-mobile-web-app-capable"
  content="yes"
>

<title>${escapeHTML(appName)}</title>

<style>

${css}

</style>

</head>

<body>

${html}

<script>

${js}

</script>

</body>
</html>`;


    // ==============================
    // RETURN BUILD
    // ==============================

    return res.status(200).json({

      success: true,

      appName: appName,

      files: {

        "index.html":
          completeHTML,

        "style.css":
          css,

        "app.js":
          js

      },

      preview: completeHTML,

      message:
        "An shirya application successfully."

    });


  } catch (error) {

    console.error(
      "BUILD APP ERROR:",
      error
    );

    return res.status(500).json({

      error:
        error?.message ||
        "An samu matsala wajen build app."

    });

  }

}


// =================================
// ESCAPE HTML
// =================================

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
