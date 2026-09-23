const apps = {
  explorer: { name: "Explorador de archivos", installed: true },
  browser: { name: "Navegador", installed: true },
  settings: { name: "Configuración", installed: true },
  calculator: { name: "Calculadora", installed: true },
  notes: { name: "Notas", installed: true },
  terminal: { name: "Terminal", installed: true },
  store: { name: "Windows 13 Fan Store", installed: true },
  paint: { name: "Paint", installed: true }
};

const state = {
  windows: {},
  zIndex: 10,
  theme: localStorage.getItem("w13-theme") || "dark",
  wallpaper: localStorage.getItem("w13-wallpaper") || ""
};

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  applyWallpaper();
  setupClock();
  setupGlobalClicks();
  setupDesktop();
  setupSearch();
  setupKeyboardShortcuts();
  renderStore();
});

function setupClock() {
  const clock = document.querySelector("#clock");
  if (!clock) return;

  const update = () => {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  update();
  setInterval(update, 1000);
}

function setupGlobalClicks() {
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;

    if (action === "start") toggleStart();
    if (action === "close-start") closeStart();
    if (action === "open-app") openApp(target.dataset.app);
    if (action === "close-window") closeWindow(target.dataset.app);
    if (action === "minimize-window") minimizeWindow(target.dataset.app);
    if (action === "maximize-window") maximizeWindow(target.dataset.app);
    if (action === "install-app") installApp(target.dataset.app);
    if (action === "uninstall-app") uninstallApp(target.dataset.app);
    if (action === "theme") changeTheme(target.dataset.theme);
    if (action === "clear-wallpaper") clearWallpaper();
  });
}

function setupDesktop() {
  document.addEventListener("dblclick", event => {
    const icon = event.target.closest("[data-app]");
    if (!icon) return;

    const app = icon.dataset.app;

    if (apps[app] && apps[app].installed) {
      openApp(app);
    }
  });
}

function toggleStart() {
  const menu = document.querySelector("#start-menu");
  if (!menu) return;

  menu.classList.toggle("hidden");
}

function closeStart() {
  const menu = document.querySelector("#start-menu");
  if (menu) menu.classList.add("hidden");
}

function openApp(appId) {
  closeStart();

  if (!apps[appId]) return;

  if (!apps[appId].installed) {
    alert("Esta aplicación no está instalada.");
    return;
  }

  let win = document.querySelector(`[data-window="${appId}"]`);

  if (!win) {
    win = createWindow(appId);
  }

  win.classList.remove("hidden");
  win.style.zIndex = ++state.zIndex;

  state.windows[appId] = {
    open: true,
    minimized: false
  };

  if (appId === "store") renderStore();
}

function createWindow(appId) {
  const windowElement = document.createElement("section");

  windowElement.className = "app-window";
  windowElement.dataset.window = appId;

  windowElement.innerHTML = `
    <header class="window-header">
      <span class="window-title">${escapeHTML(apps[appId].name)}</span>

      <div class="window-controls">
        <button data-action="minimize-window" data-app="${appId}" title="Minimizar">−</button>
        <button data-action="maximize-window" data-app="${appId}" title="Maximizar">□</button>
        <button data-action="close-window" data-app="${appId}" title="Cerrar">×</button>
      </div>
    </header>

    <main class="window-content">
      ${getAppContent(appId)}
    </main>
  `;

  document.body.appendChild(windowElement);

  makeDraggable(windowElement);

  return windowElement;
}

function getAppContent(appId) {
  switch (appId) {
    case "calculator":
      return calculatorHTML();

    case "notes":
      return notesHTML();

    case "terminal":
      return terminalHTML();

    case "browser":
      return browserHTML();

    case "explorer":
      return explorerHTML();

    case "settings":
      return settingsHTML();

    case "store":
      return storeHTML();

    case "paint":
      return paintHTML();

    default:
      return `
        <div class="app-placeholder">
          <h2>${escapeHTML(apps[appId].name)}</h2>
          <p>Aplicación lista para utilizar.</p>
        </div>
      `;
  }
}

function closeWindow(appId) {
  const win = document.querySelector(`[data-window="${appId}"]`);
  if (!win) return;

  win.remove();

  delete state.windows[appId];
}

function minimizeWindow(appId) {
  const win = document.querySelector(`[data-window="${appId}"]`);
  if (!win) return;

  win.classList.add("hidden");

  if (state.windows[appId]) {
    state.windows[appId].minimized = true;
  }
}

function maximizeWindow(appId) {
  const win = document.querySelector(`[data-window="${appId}"]`);
  if (!win) return;

  win.classList.toggle("maximized");
  win.style.zIndex = ++state.zIndex;
}

function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  if (!header) return;

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", event => {
    if (event.target.closest("button")) return;

    dragging = true;

    const rect = win.getBoundingClientRect();

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    win.style.zIndex = ++state.zIndex;
  });

  document.addEventListener("mousemove", event => {
    if (!dragging || win.classList.contains("maximized")) return;

    win.style.left = `${event.clientX - offsetX}px`;
    win.style.top = `${event.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function calculatorHTML() {
  return `
    <div class="calculator">
      <input id="calc-display" type="text" readonly value="">

      <div class="calc-grid">
        ${[
          "7","8","9","/",
          "4","5","6","*",
          "1","2","3","-",
          "0",".","=","+",
          "C"
        ].map(key => `
          <button class="calc-key" data-calc="${key}">${key}</button>
        `).join("")}
      </div>
    </div>
  `;
}

document.addEventListener("click", event => {
  const key = event.target.closest("[data-calc]");
  if (!key) return;

  const display = document.querySelector("#calc-display");
  if (!display) return;

  const value = key.dataset.calc;

  if (value === "C") {
    display.value = "";
    return;
  }

  if (value === "=") {
    try {
      if (!/^[0-9+\-*/().\s]+$/.test(display.value)) {
        display.value = "Error";
        return;
      }

      display.value = Function(
        `"use strict"; return (${display.value})`
      )();
    } catch {
      display.value = "Error";
    }

    return;
  }

  display.value += value;
});

function notesHTML() {
  const saved = localStorage.getItem("w13-notes") || "";

  return `
    <div class="notes-app">
      <textarea id="notes-text" placeholder="Escribe tus notas aquí...">${escapeHTML(saved)}</textarea>
      <button id="save-notes">Guardar</button>
    </div>
  `;
}

document.addEventListener("click", event => {
  if (event.target.id !== "save-notes") return;

  const textarea = document.querySelector("#notes-text");
  if (!textarea) return;

  localStorage.setItem("w13-notes", textarea.value);

  event.target.textContent = "Guardado";

  setTimeout(() => {
    event.target.textContent = "Guardar";
  }, 1200);
});

function terminalHTML() {
  return `
    <div class="terminal">
      <div id="terminal-output">
        Windows 13 Fan Terminal<br>
        Escribe "help" para ver los comandos.
      </div>

      <div class="terminal-input">
        <span>&gt;</span>
        <input id="terminal-command" autocomplete="off">
      </div>
    </div>
  `;
}

document.addEventListener("keydown", event => {
  if (event.target.id !== "terminal-command") return;
  if (event.key !== "Enter") return;

  const input = event.target;
  const command = input.value.trim().toLowerCase();

  const output = document.querySelector("#terminal-output");

  if (!output) return;

  let response = "";

  if (command === "help") {
    response = `
      Comandos disponibles:<br>
      help<br>
      clear<br>
      apps<br>
      date<br>
      version
    `;
  } else if (command === "clear") {
    output.innerHTML = "";
    input.value = "";
    return;
  } else if (command === "apps") {
    response = Object.values(apps)
      .map(app => `${app.name}: ${app.installed ? "instalada" : "no instalada"}`)
      .join("<br>");
  } else if (command === "date") {
    response = new Date().toString();
  } else if (command === "version") {
    response = "Windows 13 Fan Web 0.3";
  } else if (command) {
    response = `Comando no reconocido: ${escapeHTML(command)}`;
  }

  output.innerHTML += `<br>&gt; ${escapeHTML(command)}<br>${response}`;

  input.value = "";
});

function browserHTML() {
  return `
    <div class="browser-app">
      <div class="browser-bar">
        <input id="browser-url" value="https://www.youtube.com">
        <button id="browser-go">Ir</button>
      </div>

      <div class="browser-info">
        <p>
          Navegador web integrado.
          Si una página no permite mostrarse dentro de esta ventana,
          puedes abrirla en una pestaña normal del navegador.
        </p>
      </div>
    </div>
  `;
}

document.addEventListener("click", event => {
  if (event.target.id !== "browser-go") return;

  const input = document.querySelector("#browser-url");
  if (!input) return;

  let url = input.value.trim();

  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  window.open(url, "_blank", "noopener,noreferrer");
});

function explorerHTML() {
  const files = [
    "Documentos",
    "Descargas",
    "Imágenes",
    "Música",
    "Videos",
    "Windows 13 Fan"
  ];

  return `
    <div class="explorer">
      <div class="explorer-toolbar">
        <input placeholder="Buscar archivos">
      </div>

      <div class="file-grid">
        ${files.map(file => `
          <button class="file-item">
            <span class="file-icon"></span>
            <span>${file}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function settingsHTML() {
  return `
    <div class="settings-app">
      <h2>Configuración</h2>

      <div class="settings-section">
        <h3>Apariencia</h3>

        <button data-action="theme" data-theme="dark">
          Tema oscuro
        </button>

        <button data-action="theme" data-theme="light">
          Tema claro
        </button>
      </div>

      <div class="settings-section">
        <h3>Información</h3>
        <p>Windows 13 Fan Web 0.3</p>
        <p>Interfaz HTML, CSS y JavaScript.</p>
      </div>
    </div>
  `;
}

function storeHTML() {
  return `
    <div class="store-app">
      <h2>Windows 13 Fan Store</h2>
      <p>Aplicaciones disponibles</p>

      <div id="store-list"></div>
    </div>
  `;
}

function renderStore() {
  const list = document.querySelector("#store-list");
  if (!list) return;

  list.innerHTML = Object.entries(apps).map(([id, app]) => `
    <div class="store-item">
      <div>
        <strong>${escapeHTML(app.name)}</strong>
        <div>${app.installed ? "Instalada" : "No instalada"}</div>
      </div>

      <div>
        ${
          app.installed
            ? `
              <button data-action="open-app" data-app="${id}">
                Abrir
              </button>

              ${
                ["explorer", "browser", "settings", "calculator", "notes", "terminal", "store"].includes(id)
                  ? ""
                  : `<button data-action="uninstall-app" data-app="${id}">Desinstalar</button>`
              }
            `
            : `
              <button data-action="install-app" data-app="${id}">
                Instalar
              </button>
            `
        }
      </div>
    </div>
  `).join("");
}

function installApp(appId) {
  if (!apps[appId]) return;

  apps[appId].installed = true;

  saveApps();
  renderStore();
  renderStartApps();
}

function uninstallApp(appId) {
  if (!apps[appId]) return;

  apps[appId].installed = false;

  closeWindow(appId);

  saveApps();
  renderStore();
  renderStartApps();
}

function saveApps() {
  const data = {};

  Object.entries(apps).forEach(([id, app]) => {
    data[id] = app.installed;
  });

  localStorage.setItem("w13-apps", JSON.stringify(data));
}

function loadApps() {
  const data = JSON.parse(localStorage.getItem("w13-apps") || "{}");

  Object.entries(data).forEach(([id, installed]) => {
    if (apps[id]) {
      apps[id].installed = installed;
    }
  });
}

function renderStartApps() {
  const container = document.querySelector("#start-apps");
  if (!container) return;

  container.innerHTML = Object.entries(apps)
    .filter(([, app]) => app.installed)
    .map(([id, app]) => `
      <button data-action="open-app" data-app="${id}">
        ${escapeHTML(app.name)}
      </button>
    `)
    .join("");
}

function setupSearch() {
  const search = document.querySelector("#global-search");
  if (!search) return;

  search.addEventListener("input", () => {
    const query = search.value.toLowerCase().trim();

    document.querySelectorAll("[data-search-name]").forEach(element => {
      element.hidden =
        query &&
        !element.dataset.searchName.toLowerCase().includes(query);
    });
  });
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeStart();
    }

    if (event.key === "Meta" && event.key.toLowerCase() === "s") {
      event.preventDefault();
      toggleStart();
    }
  });
}

function changeTheme(theme) {
  state.theme = theme;

  localStorage.setItem("w13-theme", theme);

  applyTheme();
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
}

function applyWallpaper() {
  if (!state.wallpaper) return;

  document.body.style.backgroundImage = `url("${state.wallpaper}")`;
}

function clearWallpaper() {
  state.wallpaper = "";

  localStorage.removeItem("w13-wallpaper");

  document.body.style.backgroundImage = "";
}

function paintHTML() {
  return `
    <div class="paint-app">
      <canvas id="paint-canvas" width="700" height="420"></canvas>
      <div class="paint-toolbar">
        <input id="paint-color" type="color" value="#ffffff">
        <input id="paint-size" type="range" min="1" max="40" value="5">
        <button id="paint-clear">Limpiar</button>
      </div>
    </div>
  `;
}

document.addEventListener("click", event => {
  if (event.target.id !== "paint-clear") return;

  const canvas = document.querySelector("#paint-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.addEventListener("mousedown", event => {
  if (!event.target.closest("#paint-canvas")) return;

  const canvas = event.target;
  const ctx = canvas.getContext("2d");

  const color = document.querySelector("#paint-color")?.value || "#ffffff";
  const size = Number(document.querySelector("#paint-size")?.value || 5);

  const rect = canvas.getBoundingClientRect();

  let drawing = true;

  const draw = moveEvent => {
    if (!drawing) return;

    const x = moveEvent.clientX - rect.left;
    const y = moveEvent.clientY - rect.top;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const stop = () => {
    drawing = false;

    document.removeEventListener("mousemove", draw);
    document.removeEventListener("mouseup", stop);
  };

  document.addEventListener("mousemove", draw);
  document.addEventListener("mouseup", stop);
});

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

loadApps();
