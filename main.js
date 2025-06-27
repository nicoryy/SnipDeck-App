const { app, Tray, Menu, nativeImage, clipboard } = require("electron");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

let tray;
// Caminho para o snippets.json fora do ASAR no build
const dataPath = app.isPackaged
  ? path.join(process.resourcesPath, "app.asar.unpacked", "snippets.json")
  : path.join(__dirname, "snippets.json");

function buildContextMenu() {
  let dynamicItems = [];

  try {
    const jsonData = fs.readFileSync(dataPath, "utf-8");
    const items = JSON.parse(jsonData);

    dynamicItems = items.map((item) => ({
      label: item.name,
      click: () => {
        clipboard.writeText(item.content);
        console.log(`Copied "${item.name}" to clipboard`);
      },
    }));
  } catch (error) {
    console.error("Erro ao ler snippets.json:", error);
  }

  const fixedItems = [
    { type: "separator" },
    {
      label: "Adicionar Módulo",
      click: () => {
        exec(`code "${dataPath}"`, (error) => {
          if (error) console.error("Erro ao abrir VSCode:", error);
        });
      },
    },
    {
      label: "Sair",
      click: () => app.quit(),
    },
  ];

  const contextMenu = Menu.buildFromTemplate([...dynamicItems, ...fixedItems]);
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, "public", "logo.png")
  );
  tray = new Tray(icon);
  tray.setToolTip("SnipDeck by nIcory");

  buildContextMenu();

  // 🚀 Hot reload: escuta alterações no JSON
  fs.watchFile(dataPath, { interval: 1000 }, () => {
    console.log("snippets.json modificado — atualizando menu...");
    buildContextMenu();
  });
});
