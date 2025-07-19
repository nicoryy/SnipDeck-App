const {
  app,
  Tray,
  Menu,
  nativeImage,
  clipboard,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
  shell,
} = require("electron");
const fs = require("fs");
const path = require("path");

let tray;
let managerWindow;
let editorWindow;
let isLinkModeActive = false; // Estado da funcionalidade de links

// Caminho para o snippets.json fora do ASAR no build
const dataPath = app.isPackaged
  ? path.join(process.resourcesPath, "app.asar.unpacked", "snippets.json")
  : path.join(__dirname, "snippets.json");

// Função para extrair links do texto
function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches.slice(0, 200) : []; // Máximo 200 links
}

// Função para criar preview dos links
function createLinkPreview(links) {
  if (links.length === 0) return 'Nenhum link encontrado no clipboard.';
  
  const totalLinks = links.length;
  const previewLinks = links.slice(0, 10); // Mostrar apenas os primeiros 10 no preview
  
  let preview = `Encontrados ${totalLinks} link(s) total`;
  
  if (totalLinks > 10) {
    preview += ` (mostrando primeiros 10)`;
  }
  
  preview += `:\n\n`;
  
  previewLinks.forEach((link, index) => {
    const shortLink = link.length > 60 ? link.substring(0, 60) + '...' : link;
    preview += `${index + 1}. ${shortLink}\n`;
  });
  
  if (totalLinks > 10) {
    preview += `\n... e mais ${totalLinks - 10} link(s)`;
  }
  
  return preview;
}

// Função para abrir links
function openLinks(links) {
  links.forEach(link => {
    shell.openExternal(link);
  });
}

// Função para processar clipboard e abrir links
function processClipboard() {
  if (!isLinkModeActive) return;
  
  const clipboardText = clipboard.readText();
  if (!clipboardText) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Clipboard vazio',
      message: 'Não há texto no clipboard.',
      buttons: ['OK']
    });
    return;
  }
  
  const links = extractLinks(clipboardText);
  if (links.length === 0) {
    dialog.showMessageBox({
      type: 'info',
      title: 'Nenhum link encontrado',
      message: 'Não foram encontrados links no clipboard.',
      buttons: ['OK']
    });
    return;
  }
  
  const preview = createLinkPreview(links);
  const response = dialog.showMessageBoxSync({
    type: 'question',
    title: 'Abrir links do clipboard?',
    message: preview,
    buttons: ['Abrir todos', 'Cancelar'],
    defaultId: 0,
    cancelId: 1
  });
  
  if (response === 0) {
    openLinks(links);
  }
}

// Função para alternar modo de links
function toggleLinkMode() {
  isLinkModeActive = !isLinkModeActive;
  updateTrayIcon();
  
  const status = isLinkModeActive ? 'ativado' : 'desativado';
  console.log(`Modo de links ${status}`);
}

// Função para atualizar o ícone do tray baseado no estado
function updateTrayIcon() {
  // Criar ícone colorido baseado no estado
  const iconPath = isLinkModeActive 
    ? path.join(__dirname, "public", "green_circle.png")
    : path.join(__dirname, "public", "red_circle.png");
    
  // Se não existir logo_active.png, criar um ícone verde programaticamente
  let icon;
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    // Usar o ícone padrão e adicionar um overlay visual no tooltip
    icon = nativeImage.createFromPath(path.join(__dirname, "public", "logo.png"));
  }
  
  tray.setImage(icon);
  
  const baseTooltip = "SnipDeck by nIcory";
  const linkStatus = isLinkModeActive ? " | Links: ATIVO 🟢" : " | Links: INATIVO 🔴";
  tray.setToolTip(baseTooltip + linkStatus);
}

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
      label: `Modo Links: ${isLinkModeActive ? 'ATIVO 🟢' : 'INATIVO 🔴'}`,
      click: toggleLinkMode,
    },
    {
      label: "Processar Clipboard (Alt+Ctrl+Shift+Space)",
      click: processClipboard,
      enabled: isLinkModeActive,
    },
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
  
  // Definir tooltip inicial
  updateTrayIcon();
  buildContextMenu();

  // Registrar atalhos globais
  globalShortcut.register("Control+Alt+C", () => {
    toggleLinkMode();
    buildContextMenu(); // Atualizar menu após mudança de estado
  });

  globalShortcut.register("Alt+Control+Shift+Space", () => {
    processClipboard();
  });

  console.log('SnipDeck iniciado com funcionalidade de links!');
  console.log('Atalhos:');
  console.log('- Ctrl + Alt + C: Ativar/Desativar modo de links');
  console.log('- Alt + Ctrl + Shift + Space: Processar clipboard (quando ativo)');

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

app.on("will-quit", () => {
  // Limpar todos os atalhos globais quando o app for fechado
  globalShortcut.unregisterAll();
});