import './app';
import './index.css';

import { ISettings, IAvaliablePorts } from './definitions/interfaces';

declare global {
  interface Window {
    electronAPI : {
      runMirror: (newSettings : ISettings) => void;
      stopMirror: () => void;
      videoEnded: () => void;
      exitFullScreen: () => void;

      getSettings: () => Promise<ISettings>;
      getLoopDirectory: () => Promise<string>;
      getStartleFile: () => Promise<string>;
      getArduinoPorts: () => Promise<Array<IAvaliablePorts>>;
      testArduinoConnection: (port : string) => Promise<boolean>;      

      onPlayVideo: (callback : any) => void;
      onStartleVideo: (callback : any) => void;
      onNavTo: (callback : any) => void;
    }
  }
}

document.addEventListener("keydown", event => {
  switch (event.key) {
      case "Escape":
          
          window.electronAPI.exitFullScreen();

          break;
       }
});

