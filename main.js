const { app, Tray, Menu, nativeImage, clipboard, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

let tray;
let managerWindow;
let editorWindow;

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
      label: "Update Snippets",
      click: () => {
        createManagerWindow();
      },
    },
    {
      label: "Quit",
      click: () => app.quit(),
    },
  ];

  const contextMenu = Menu.buildFromTemplate([...dynamicItems, ...fixedItems]);
  tray.setContextMenu(contextMenu);
}

function createManagerWindow() {
  if (managerWindow) {
    managerWindow.focus();
    return;
  }

  managerWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    title: "SnipDeck Manager",
    autoHideMenuBar: true,
    frame: true,
  });

  managerWindow.loadFile("manager.html");

  managerWindow.on("closed", () => {
    managerWindow = null;
  });
}

function createEditorWindow(snippet = null, isEdit = false) {
  if (editorWindow) {
    editorWindow.focus();
    return;
  }

  editorWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: true,
    title: isEdit ? "Editar Snippet" : "Adicionar Snippet",
    parent: managerWindow,
    modal: true,
    autoHideMenuBar: true,
    frame: true,
  });

  editorWindow.loadFile("editor.html");

  editorWindow.webContents.once("did-finish-load", () => {
    if (snippet) {
      editorWindow.webContents.send("load-snippet", snippet);
    }
  });

  editorWindow.on("closed", () => {
    editorWindow = null;
  });
}

// IPC Handlers
ipcMain.handle("get-snippets", () => {
  try {
    const jsonData = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Erro ao ler snippets.json:", error);
    return [];
  }
});

ipcMain.handle("delete-snippet", (event, index) => {
  try {
    const jsonData = fs.readFileSync(dataPath, "utf-8");
    const snippets = JSON.parse(jsonData);
    
    snippets.splice(index, 1);
    
    fs.writeFileSync(dataPath, JSON.stringify(snippets, null, 2));
    buildContextMenu(); // Atualiza o menu do tray
    return true;
  } catch (error) {
    console.error("Erro ao deletar snippet:", error);
    return false;
  }
});

ipcMain.handle("save-snippet", (event, snippet, index = null) => {
  try {
    const jsonData = fs.readFileSync(dataPath, "utf-8");
    const snippets = JSON.parse(jsonData);
    
    if (index !== null) {
      // Editar snippet existente
      snippets[index] = snippet;
    } else {
      // Adicionar novo snippet
      snippets.push(snippet);
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(snippets, null, 2));
    buildContextMenu(); // Atualiza o menu do tray
    return true;
  } catch (error) {
    console.error("Erro ao salvar snippet:", error);
    return false;
  }
});

ipcMain.on("open-editor", (event, snippet = null, index = null) => {
  createEditorWindow(snippet ? { ...snippet, index } : null, snippet !== null);
});

ipcMain.on("close-editor", () => {
  if (editorWindow) {
    editorWindow.close();
  }
});

ipcMain.on("refresh-manager", () => {
  if (managerWindow) {
    managerWindow.webContents.send("refresh-snippets");
  }
});

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
    
    // Atualiza a janela do manager se estiver aberta
    if (managerWindow) {
      managerWindow.webContents.send("refresh-snippets");
    }
  });
});

app.on("window-all-closed", (event) => {
  // Previne que o app feche quando todas as janelas são fechadas
  event.preventDefault();
});