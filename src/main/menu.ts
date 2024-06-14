import { BrowserWindow, Menu } from 'electron';



const buildMenu = (app : Electron.App, mainWindow : BrowserWindow) => {

  const menu = Menu.buildFromTemplate([
    {
      label: "Mirror",
      submenu: [
        {
          click: () => mainWindow.webContents.send('nav-to', ''),
          label: 'Settings'
        },
        { 
          click: () => mainWindow.webContents.openDevTools(),
          label: 'Dev Tools'
        },        
        { 
          click: () => app.quit(),
          label: 'Exit'
        }
        
      ]
    }
  ])
  
  Menu.setApplicationMenu(menu);
  return menu; 
}

export { buildMenu };