const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, {
    stdio: "inherit",
    shell: true
  });
}

const root = process.cwd();
const www = path.join(root, "www");

fs.mkdirSync(www, { recursive: true });

const indexPath = path.join(www, "index.html");

const sourceIndex = path.join(root, "index.html");

if (fs.existsSync(sourceIndex)) {
  fs.copyFileSync(sourceIndex, indexPath);
} else {
  fs.writeFileSync(
    indexPath,
    `<!doctype html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width,initial-scale=1">
  <title>Center App AI</title>
</head>
<body>
  <h1>Center App AI</h1>
</body>
</html>`
  );
}

if (!fs.existsSync(path.join(root, "node_modules"))) {
  run("npm install");
}

const capacitorConfig = `
const config = {
  appId: "com.centerapp.ai",
  appName: "Center App AI",
  webDir: "www"
};

module.exports = config;
`;

fs.writeFileSync(
  path.join(root, "capacitor.config.cjs"),
  capacitorConfig
);

run("npx cap add android");
run("npx cap copy android");

process.chdir(path.join(root, "android"));

run("./gradlew assembleDebug");

console.log("\nAPK BUILD COMPLETED");

console.log(
  "APK:",
  path.join(
    process.cwd(),
    "app",
    "build",
    "outputs",
    "apk",
    "debug",
    "app-debug.apk"
  )
);
