let generatedApp = {
  html: "",
  css: "",
  js: ""
};


/* =========================================
   CREATE APP
========================================= */

async function createApp() {

  const appName =
    document.getElementById("appName").value.trim();

  const description =
    document.getElementById("description").value.trim();

  const category =
    document.getElementById("category").value;

  const button =
    document.getElementById("createButton");

  const loading =
    document.getElementById("loading");

  const errorBox =
    document.getElementById("error");

  const result =
    document.getElementById("result");


  /* =========================================
     VALIDATION
  ========================================= */

  if (!appName) {

    showError(
      "Rubuta sunan app ɗinka."
    );

    return;
  }


  if (!description) {

    showError(
      "Bayyana abin da app ɗin zai yi."
    );

    return;
  }


  /* =========================================
     FEATURES
  ========================================= */

  const selectedFeatures =
    Array.from(
      document.querySelectorAll(
        ".featureCheck:checked"
      )
    ).map(
      x => x.value
    );


  const features =
    selectedFeatures.length
      ? selectedFeatures.join(", ")
      : "Babu takamaiman features";


  /* =========================================
     AI PROMPT
  ========================================= */

  const prompt = `
Kai ne Creator App AI.

Ka ƙirƙiri frontend application bisa wannan bayanin.

SUNAN APP:
${appName}

NAU'IN APP:
${category}

BAYANIN APP:
${description}

FEATURES:
${features}

Ka ƙirƙiri:

1. HTML
2. CSS
3. JavaScript

Application ya zama:

- Modern
- Professional
- Responsive ga Android
- Buttons su yi aiki
- Navigation ta yi aiki
- Forms su yi aiki
- UI ya zama mai kyau

Idan yana buƙatar API
wanda ba a bayar ba,
yi DEMO frontend kawai.

Kada ka saka API key
a frontend.

Ka dawo da JSON kawai:

{
  "html": "...",
  "css": "...",
  "js": "..."
}
`;


  /* =========================================
     LOADING
  ========================================= */

  button.disabled = true;

  button.textContent =
    "🤖 Ana ƙirƙirar...";

  loading.style.display =
    "block";

  errorBox.style.display =
    "none";

  result.style.display =
    "none";


  /* =========================================
     BACKEND REQUEST
  ========================================= */

  try {

    const response =
      await fetch(
        "/api/create-app",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            prompt: prompt
          })
        }
      );


    /* =========================================
       READ SERVER RESPONSE
    ========================================= */

    const rawText =
      await response.text();


    let data = {};


    try {

      data =
        JSON.parse(
          rawText
        );

    } catch (e) {

      throw new Error(
        "Server bai dawo da JSON ba. Response: " +
        rawText.substring(
          0,
          300
        )
      );

    }


    /* =========================================
       BACKEND ERROR
    ========================================= */

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Backend error: HTTP " +
        response.status
      );

    }


    /* =========================================
       VALIDATE AI RESULT
    ========================================= */

    if (
      typeof data.html !==
      "string"
    ) {

      throw new Error(
        "AI bai dawo da HTML ba."
      );

    }


    if (
      typeof data.css !==
      "string"
    ) {

      throw new Error(
        "AI bai dawo da CSS ba."
      );

    }


    if (
      typeof data.js !==
      "string"
    ) {

      throw new Error(
        "AI bai dawo da JavaScript ba."
      );

    }


    /* =========================================
       SAVE GENERATED APP
    ========================================= */

    generatedApp = {

      html:
        data.html,

      css:
        data.css,

      js:
        data.js

    };


    /* =========================================
       SHOW HTML CODE
    ========================================= */

    const htmlCode =
      document.getElementById(
        "htmlCode"
      );


    if (htmlCode) {

      htmlCode.textContent =
        data.html;

    }


    /* =========================================
       SHOW CSS CODE
    ========================================= */

    const cssCode =
      document.getElementById(
        "cssCode"
      );


    if (cssCode) {

      cssCode.textContent =
        data.css;

    }


    /* =========================================
       SHOW JAVASCRIPT CODE
    ========================================= */

    const jsCode =
      document.getElementById(
        "jsCode"
      );


    if (jsCode) {

      jsCode.textContent =
        data.js;

    }


    /* =========================================
       APP INFORMATION
    ========================================= */

    const appInfo =
      document.getElementById(
        "appInfo"
      );


    if (appInfo) {

      appInfo.innerHTML =
        `
        <p>
          <strong>APP:</strong>
          ${escapeHtml(appName)}
        </p>

        <p>
          <strong>NAU'I:</strong>
          ${escapeHtml(category)}
        </p>

        <p>
          <strong>STATUS:</strong>
          ✅ An ƙirƙiri frontend
        </p>
        `;

    }


    /* =========================================
       PREVIEW
    ========================================= */

    if (
      typeof showPreview ===
      "function"
    ) {

      showPreview(
        data.html,
        data.css,
        data.js
      );

    }


    /* =========================================
       SHOW RESULT
    ========================================= */

    result.style.display =
      "block";


    result.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error(
      "CREATE APP ERROR:",
      error
    );


    showError(
      error.message ||
      "An samu matsala wajen ƙirƙirar app."
    );


  } finally {

    /* =========================================
       RESTORE BUTTON
    ========================================= */

    button.disabled =
      false;

    button.textContent =
      "✨ Fara Ƙirƙirar App";


    loading.style.display =
      "none";

  }

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

  const errorBox =
    document.getElementById(
      "error"
    );


  if (!errorBox) {

    alert(message);

    return;

  }


  errorBox.textContent =
    "❌ " + message;


  errorBox.style.display =
    "block";


  errorBox.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(text) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    text;


  return div.innerHTML;

}


/* =========================================
   DOWNLOAD GENERATED HTML
========================================= */

function downloadGeneratedApp() {

  if (
    !generatedApp.html
  ) {

    alert(
      "Da farko ka ƙirƙiri app."
    );

    return;

  }


  const fullHtml = `
<!DOCTYPE html>

<html lang="ha">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<title>Generated App</title>

<style>

${generatedApp.css}

</style>

</head>

<body>

${generatedApp.html}

<script>

${generatedApp.js}

<\/script>

</body>

</html>
`;


  const blob =
    new Blob(
      [fullHtml],
      {
        type:
          "text/html;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    "generated-app.html";


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );

}


/* =========================================
   COPY GENERATED HTML
========================================= */

function copyGeneratedHTML() {

  if (
    !generatedApp.html
  ) {

    alert(
      "Da farko ka ƙirƙiri app."
    );

    return;

  }


  const fullHtml = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<style>

${generatedApp.css}

</style>

</head>

<body>

${generatedApp.html}

<script>

${generatedApp.js}

<\/script>

</body>

</html>
`;


  navigator.clipboard
    .writeText(
      fullHtml
    )
    .then(
      () => {

        alert(
          "✅ An kwafe complete app code."
        );

      }
    )
    .catch(
      () => {

        alert(
          "Ba a iya kwafa code ba."
        );

      }
    );

}


/* =========================================
   SAVE PROJECT
========================================= */

function saveGeneratedProject() {

  if (
    !generatedApp.html
  ) {

    alert(
      "Da farko ka ƙirƙiri app."
    );

    return;

  }


  const appNameInput =
    document.getElementById(
      "appName"
    );


  const descriptionInput =
    document.getElementById(
      "description"
    );


  const categoryInput =
    document.getElementById(
      "category"
    );


  const project = {

    appName:
      appNameInput
        ? appNameInput.value.trim()
        : "",

    description:
      descriptionInput
        ? descriptionInput.value.trim()
        : "",

    category:
      categoryInput
        ? categoryInput.value
        : "",

    html:
      generatedApp.html,

    css:
      generatedApp.css,

    js:
      generatedApp.js,

    savedAt:
      new Date().toISOString()

  };


  localStorage.setItem(
    "centerAppGeneratedProject",
    JSON.stringify(
      project
    )
  );


  alert(
    "✅ An ajiye project ɗin."
  );

}


/* =========================================
   LOAD SAVED PROJECT
========================================= */

function loadGeneratedProject() {

  try {

    const saved =
      localStorage.getItem(
        "centerAppGeneratedProject"
      );


    if (!saved) {

      return;

    }


    const project =
      JSON.parse(
        saved
      );


    if (
      !project.html ||
      !project.css ||
      !project.js
    ) {

      return;

    }


    generatedApp = {

      html:
        project.html,

      css:
        project.css,

      js:
        project.js

    };


  } catch (error) {

    console.error(
      "LOAD PROJECT ERROR:",
      error
    );

  }

}


/* =========================================
   AUTO LOAD
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    loadGeneratedProject();

  }
);
