import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {  
  runMirror: (cooldown : number) => ipcRenderer.send('run-mirror', cooldown),
  stopMirror: () => ipcRenderer.send('stop-mirror'),
  videoEnded: () => ipcRenderer.send('video-ended'),
  exitFullScreen: () => ipcRenderer.send('exit-full-screen'),

  getSettings: () => ipcRenderer.invoke('data:getSettings'),
  getLoopDirectory: () => ipcRenderer.invoke('dialog:getLoopDirectory'),
  getStartleFile: () => ipcRenderer.invoke('dialog:getStartleFile'),
  getArduinoPorts: () => ipcRenderer.invoke('data:getArduinoPorts'),  
  testArduinoConnection: (port : string) => ipcRenderer.invoke('data:testArduinoConnection', port),    

  onPlayVideo: (callback : any) => ipcRenderer.on('play-video', (_event, value) => callback(value)),
  onStartleVideo: (callback : any) => ipcRenderer.on('startle-video', (_event, value) => callback(value)),
  onNavTo: (callback : any) => ipcRenderer.on('nav-to', (_event, value) => callback(value)),
});