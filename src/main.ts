import { app, BrowserWindow, dialog, ipcMain, protocol } from 'electron';
import path from 'path';

import { buildMenu } from './main/menu';
import { ISettings } from './definitions/interfaces';
import { handleFileProtocl, convertToHauntProtocol } from './main/protocol';
import { writeSettingsToFile, readSettingsFromFile } from './main/settings';
import videoFiles from './main/videos';
import serialConnection from './SerialConnection/connection';
import configs from './definitions/configs';

const settings : ISettings = readSettingsFromFile();

let mainWindow : BrowserWindow | null = null; 
let isMirrorRunning = false;
let lastStartlePlay = new Date();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // width: 800,
    // height: 600,
    width: 1200,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  buildMenu(app, mainWindow);

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};


// Setting up the haunt protcol allows the UI to retrive a specified list of files from the local machine.  
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'haunt',
    privileges: {
      standard: true,
      bypassCSP: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    }
  }
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    
  ipcMain.on('run-mirror', startMirror);
  ipcMain.on('stop-mirror', stopMirror);
  ipcMain.on('video-ended', decideNextVideo);
  ipcMain.on('exit-full-screen', minimizeWindow);

  ipcMain.handle('data:getSettings', handleSettingsRequest);
  ipcMain.handle('dialog:getLoopDirectory', handleGetLoopDirectory);
  ipcMain.handle('dialog:getStartleFile', handleGetStartleFile);
  ipcMain.handle('data:getArduinoPorts', handleGetArduinoPorts);

  protocol.handle('haunt', handleFileProtocl);

  createWindow();
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function handleSettingsRequest () : Promise<ISettings> {
 
  return settings;
}

async function handleGetLoopDirectory () : Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({properties: ['openDirectory']});

  if (!canceled) {
    if (!videoFiles.getMp4FilesForLoop(filePaths[0])) {
      throw new Error("No videos found in the selected directory");
    }

    settings.loopDirectory = filePaths[0];
    return filePaths[0];
  }
}

async function handleGetStartleFile () : Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog({filters: [{ name: "Movies", extensions: ["mp4"]}], properties: ['openFile']});

  if (!canceled) {    

    settings.startleFile = filePaths[0];
    return filePaths[0];
  }
}

async function handleGetArduinoPorts () : Promise<any> {
  return await serialConnection.getPortOptions();
}


function startMirror (event : any, newSettings : ISettings) {
  
  settings.cooldownBetweenVideos = newSettings.cooldownBetweenVideos;
  settings.loopDirectory = newSettings.loopDirectory;
  settings.useArduino = newSettings.useArduino;
  settings.selectedPortPath = newSettings.selectedPortPath;
  settings.startleFile = newSettings.startleFile;
  settings.startleDistance = newSettings.startleDistance;

  isMirrorRunning = true;

  writeSettingsToFile(settings);

  mainWindow.setFullScreen(true);
  mainWindow.setAutoHideMenuBar(true);

  if ((settings.useArduino) && (settings.selectedPortPath)) {
    const parser = serialConnection.connectToArduino(settings.selectedPortPath);
    // serialConnection.dataHandler = serialDataParser;

    // parser.on('data', serialDataParser);
  }

  
  mainWindow.webContents.send('nav-to', 'Empty');  //Navigates to the blank screen, and then starts the timer to show the ghost
  playVideoAfterCooldown();
}


function serialDataParser (data : string) {
  
  switch (data) {

    case "<Startle>": 
      // mainWindow.webContents.send('startle');
      console.log('Startle Sent');
      break;
    
    case "Sending an event":
        
      if ((settings.startleFile) && (isMirrorRunning)) {

        console.log(Date.now() - lastStartlePlay.getTime());

        if ((Date.now() - lastStartlePlay.getTime()) < configs.STARLE_COOL_DOWN) {
          console.log('Startle file played too recently');
          return;
        }

        lastStartlePlay = new Date();

        const urlPathToVideo = convertToHauntProtocol(settings.startleFile);
        mainWindow.webContents.send('startle-video', urlPathToVideo);      
        // mainWindow.webContents.send('play-video', "");      
      } else { 
        console.log('No startle file selected');
      }
      break;


    default: 
      console.log('Serial Data: ' + data);
      break;
  }
  
  

}

function decideNextVideo () {  
  //Decide if we start another iteration of the loop or not. 
  
  if (isMirrorRunning)  {
    playVideoAfterCooldown();
  }  

}

function playVideoAfterCooldown () { 

  
  setTimeout(function() {
    // Check to see if the user aborted in the time the timer was running
    if (isMirrorRunning)  {

      const videoToPlay : string = videoFiles.getRandomLoopFile();      
      const urlPathToVideo = convertToHauntProtocol(videoToPlay);

      if (urlPathToVideo) {
        mainWindow.webContents.send('play-video', urlPathToVideo);      
        //mainWindow.webContents.send('play-video', "");      
      } 
    } 
    
  }, settings.cooldownBetweenVideos * 1000);

}

function stopMirror () {

  isMirrorRunning = false;

}

function minimizeWindow () {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
    mainWindow.setAutoHideMenuBar(false);
    mainWindow.setMenuBarVisibility(true);
  }
}

serialConnection.setDataHandler(serialDataParser);