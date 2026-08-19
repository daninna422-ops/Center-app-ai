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
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    // ==========================================
    // GET DATA
    // ==========================================

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
      typeof body.appName === "string" &&
      body.appName.trim()
        ? body.appName.trim()
        : "My App";


    // ==========================================
    // VALIDATION
    // ==========================================

    if (!html.trim()) {
      return res.status(400).json({
        success: false,
        error: "HTML bai zo ba."
      });
    }

    if (!css.trim()) {
      return res.status(400).json({
        success: false,
        error: "CSS bai zo ba."
      });
    }

    if (!js.trim()) {
      return res.status(400).json({
        success: false,
        error: "JavaScript bai zo ba."
      });
    }


    // ==========================================
    // SAFE APP NAME
    // ==========================================

    const safeName =
      appName
        .replace(/[<>:"/\\|?*]/g, "")
        .trim()
        .substring(0, 80) ||
      "My App";


    // ==========================================
    // COMPLETE HTML
    // ==========================================

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

<meta
  name="apple-mobile-web-app-status-bar-style"
  content="default"
>

<meta
  name="description"
  content="${escapeHTML(
    safeName + " - App"
  )}"
>

<link
  rel="manifest"
  href="manifest.json"
>

<title>${escapeHTML(safeName)}</title>

<style>

${css}

</style>

</head>

<body>

${html}

<script>

${js}

</script>

<script>

/*
========================================
PWA SERVICE WORKER REGISTRATION
========================================
*/

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    function () {

      navigator.serviceWorker
        .register("./sw.js")
        .catch(function (error) {

          console.log(
            "Service Worker:",
            error
          );

        });

    }
  );

}

</script>

</body>

</html>`;


    // ==========================================
    // MANIFEST
    // ==========================================

    const manifest = {

      name: safeName,

      short_name:
        safeName.substring(0, 20),

      description:
        safeName +
        " application",

      start_url:
        "./index.html",

      display:
        "standalone",

      orientation:
        "portrait",

      background_color:
        "#ffffff",

      theme_color:
        "#1261d6",

      lang:
        "ha",

      categories: [
        "business",
        "productivity"
      ],

      icons: []

    };


    // ==========================================
    // SERVICE WORKER
    // ==========================================

    const serviceWorker = `

const CACHE_NAME =
  "${slugify(safeName)}-v1";

const FILES = [

  "./",

  "./index.html",

  "./style.css",

  "./app.js",

  "./manifest.json"

];


self.addEventListener(
  "install",
  function (event) {

    event.waitUntil(

      caches
        .open(CACHE_NAME)
        .then(function (cache) {

          return cache.addAll(
            FILES
          );

        })

    );

    self.skipWaiting();

  }
);


self.addEventListener(
  "activate",
  function (event) {

    event.waitUntil(

      caches
        .keys()
        .then(function (keys) {

          return Promise.all(

            keys.map(function (key) {

              if (
                key !== CACHE_NAME
              ) {

                return caches.delete(
                  key
                );

              }

            })

          );

        })

    );

    self.clients.claim();

  }
);


self.addEventListener(
  "fetch",
  function (event) {

    event.respondWith(

      caches
        .match(event.request)
        .then(function (cached) {

          return cached ||
            fetch(event.request)
              .catch(function () {

                return caches.match(
                  "./index.html"
                );

              });

        })

    );

  }
);

`;


    // ==========================================
    // FILES
    // ==========================================

    const files = {

      "index.html":
        completeHTML,

      "style.css":
        css,

      "app.js":
        js,

      "manifest.json":
        JSON.stringify(
          manifest,
          null,
          2
        ),

      "sw.js":
        serviceWorker

    };


    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({

      success: true,

      appName:
        safeName,

      type:
        "PWA",

      installable:
        true,

      files:

        files,

      preview:
        completeHTML,

      message:
        "An shirya application successfully.",

      instructions: [

        "An haɗa HTML.",

        "An haɗa CSS.",

        "An haɗa JavaScript.",

        "An ƙara PWA manifest.",

        "An ƙara Service Worker.",

        "Application ɗin zai iya zama installable a Android."

      ]

    });


  } catch (error) {

    console.error(
      "BUILD APP ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      error:
        error?.message ||
        "An samu matsala wajen build app."

    });

  }

}


// ==========================================
// ESCAPE HTML
// ==========================================

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


// ==========================================
// CREATE SAFE FILE NAME
// ==========================================

function slugify(value) {

  return String(value)

    .toLowerCase()

    .replace(
      /[^a-z0-9]+/g,
      "-"
    )

    .replace(
      /^-+|-+$/g,
      ""
    )

    .substring(0, 40)

    || "my-app";

}
