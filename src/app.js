const { app, BrowserWindow, Tray, Menu, dialog, ipcMain } = require("electron");
const path = require("path");
const Store = require("electron-store");
const ip = require("ip");
const os = require("os")

const store = new Store("config");

if (store.size == 0) {
    console.log("Generando Archivo de Configuración")
    store.set("config", {
        server: {
            host: "http://localhost",
            port: 6969
        },
        password: "L1v1ngF@st3r"
    });
}

const config = store.get("config");
config.local = { ip: ip.address(), hostname: os.hostname() }


const icon_path = path.join(__dirname, "assets", "icons", "icon.png")


var configWindow;

async function createWindow({ view = "", name = "", hide = false } = {}) {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: icon_path,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });

    if (hide) {
        win.hide();
        win.on('close', (event) => {
            if (!app.quitting) {
                event.preventDefault()
                win.hide()
            } else {
                win.webContents.send("closing_window")
            }
        })
    }

    win.name = name
    win.loadFile(path.join(__dirname, "views", view));
    return win
}


function setTrayIcon() {
    const tray = new Tray(icon_path);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Configuración",
            click: () => {
                configWindow.show()
            }
        },
        { type: "separator" },
        {
            label: "Salir", click: () => {
                dialog.showMessageBox({
                    title: "SALIR",
                    message: "Seguro de Salir?",
                    buttons: ["Simón", "Cancelar"],
                    noLink: true,
                    type: "question"
                }).then(({ response }) => {
                    if (response == 0) {
                        app.quit();
                    }
                })
            }
        },
    ]);
    tray.setToolTip("Control de Laboratorios");
    tray.setContextMenu(contextMenu);
}

app.whenReady().then(async () => {
    setTrayIcon();
    configWindow = await createWindow({ view: "config.html", name: "config", hide: true })
    configWindow.hide();
    configWindow.webContents.send("config", config)
})


app.on('before-quit', () => app.quitting = true);


ipcMain.handle("config", async (event, data) => {
    if (data.set) {
        store.set("config.server.host", data.server.host)
        store.set("config.server.port", data.server.port)
        config.server = data.server
    }

    return config
})


function openChrome(url = "https://admision.pucesd.edu.ec/login/index.php") {
    const win = new BrowserWindow({
        fullscreen: true,
    });
    win.setMenu(null);
    win.loadURL(url);

    win.on("close", () => {
        closeChrome();
    })
}

function closeChrome() {
    console.log("cerrado")
}


