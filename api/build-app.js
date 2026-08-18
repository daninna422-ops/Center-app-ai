export default async function handler(req, res) {
  // ==========================================
  // CORS
  // ==========================================

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

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    const body = req.body || {};

    const appName =
      typeof body.appName === "string" &&
      body.appName.trim()
        ? body.appName.trim()
        : "Center App";

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

    if (!html && !css && !js) {
      return res.status(400).json({
        success: false,
        error: "Babu app code da za a build."
      });
    }

    // ==========================================
    // CREATE COMPLETE HTML
    // ==========================================

    const completeHTML = `<!DOCTYPE html>
<html lang="ha">
<head>
<meta charset="UTF-8">
<meta name="viewport"
content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#1261d6">
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

    // ==========================================
    // DATA URL
    // ==========================================

    const encoded =
      Buffer
        .from(completeHTML, "utf8")
        .toString("base64");

    const downloadUrl =
      `data:text/html;base64,${encoded}`;

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      appName,

      format: "html",

      readyForAndroidBuild: true,

      files: {
        "index.html": completeHTML
      },

      preview: completeHTML,

      downloadUrl,

      message:
        "An shirya app ɗin. Za a iya buɗe ko sauke generated HTML. Android APK yana buƙatar Android build service."
    });

  } catch (error) {

    console.error(
      "BUILD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "An samu matsala yayin shirya app.",
      details:
        error.message
    });
  }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
