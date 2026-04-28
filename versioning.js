const fs = require("fs");
const path = require("path");

// fichier qui stocke la version actuelle
const versionFile = path.join(__dirname, ".version");

// lire la version actuelle et l'incrémenter
let VERSION = 1;
if (fs.existsSync(versionFile)) {
  VERSION = parseInt(fs.readFileSync(versionFile, "utf8"), 10) + 1;
}
fs.writeFileSync(versionFile, String(VERSION));

console.log(`Version : ${VERSION}`);

// fonction pour ajouter ?v=...
function addVersioning(content) {
  return content.replace(
    /(src|href)="([^"]+\.(css|js))(\?v=\d+)?"/g,
    (match, attr, file, ext, existingVersion) => {
      return `${attr}="${file}?v=${VERSION}"`;
    }
  );
}

// parcourir tous les fichiers HTML
const folder = "./";

fs.readdirSync(folder)
  .filter(file => file.endsWith(".html"))
  .forEach(file => {
    const filePath = path.join(folder, file);
    let content = fs.readFileSync(filePath, "utf8");

    const updatedContent = addVersioning(content);

    fs.writeFileSync(filePath, updatedContent);
    console.log(` ${file} mis à jour`);
  });
