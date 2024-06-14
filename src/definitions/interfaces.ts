interface ISettings {

  cooldownBetweenVideos: number; 
  loopDirectory: string;  
  useArduino: boolean;
  selectedPortPath : string;
  startleFile: string;
  startleDistance: number;

}

interface IAvaliablePorts {
  friendlyName: string;
  path: string;
}

export {
  ISettings,
  IAvaliablePorts
}