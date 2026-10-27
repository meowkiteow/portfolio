const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "dist");
if (path.dirname(output) !== root || path.basename(output) !== "dist") {
  throw new Error("Build output must stay inside the project dist directory.");
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const entries = [
  "index.html", "_DataURI", "api.framer.com", "app.framerstatic.com",
  "assets", "components", "fonts.gstatic.com", "framer.com",
  "framerusercontent.com", "ga.jspm.io", "lib", "www.instagram.com",
];

for (const entry of entries) {
  const source = path.join(root, entry);
  if (!fs.existsSync(source)) continue;
  fs.cpSync(source, path.join(output, entry), {
    recursive: true,
    filter(file) {
      const relative = path.relative(root, file).split(path.sep).join("/");
      return relative !== "assets/jayzee-videos" && !path.basename(file).startsWith(".");
    },
  });
}

console.log("Static portfolio built in dist/.");
