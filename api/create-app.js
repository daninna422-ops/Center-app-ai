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

  if (!appName) {
    showError("Rubuta sunan app ɗinka.");
    return;
  }

  if (!description) {
    showError("Bayyana abin da app ɗin zai yi.");
    return;
  }

  const selectedFeatures =
    Array.from(
      document.querySelectorAll(".featureCheck:checked")
    ).map(x => x.value);

  const features =
    selectedFeatures.length
      ? selectedFeatures.join(", ")
      : "Babu takamaiman features";

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

Application ya zama modern, professional,
responsive ga Android kuma buttons su yi aiki.

Idan yana buƙatar API wanda ba a bayar ba,
yi DEMO frontend kawai.

Kada ka saka API key a frontend.

Ka dawo da JSON kawai mai:

{
  "html": "...",
  "css": "...",
  "js": "..."
}
`;

  button.disabled = true;
  button.textContent = "🤖 Ana ƙirƙirar...";
  loading.style.display = "block";
  errorBox.style.display = "none";
  result.style.display = "none";

  try {

    const response = await fetch("/api/create-app", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        prompt: prompt
      })
    });

    const rawText = await response.text();

    let data = {};

    try {
      data = JSON.parse(rawText);
    } catch (e) {
      throw new Error(
        "Server bai dawo da JSON ba. Response: " +
        rawText.substring(0, 300)
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Backend error: HTTP " + response.status
      );
    }

    if (
      typeof data.html !== "string" ||
      typeof data.css !== "string" ||
      typeof data.js !== "string"
    ) {
      throw new Error(
        "AI bai dawo da HTML, CSS da JavaScript ba."
      );
    }

    generatedApp = {
      html: data.html,
      css: data.css,
      js: data.js
    };

    document.getElementById("htmlCode").textContent =
      data.html;

    document.getElementById("cssCode").textContent =
      data.css;

    document.getElementById("jsCode").textContent =
      data.js;

    document.getElementById("appInfo").innerHTML =
      "<p><strong>APP:</strong> " +
      escapeHtml(appName) +
      "</p>";

    showPreview(
      data.html,
      data.css,
      data.js
    );

    result.style.display = "block";

    result.scrollIntoView({
      behavior: "smooth"
    });

  } catch (error) {

    console.error("CREATE APP ERROR:", error);

    showError(
      error.message ||
      "An samu matsala wajen ƙirƙirar app."
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "✨ Fara Ƙirƙirar App";

    loading.style.display = "none";
  }
}
