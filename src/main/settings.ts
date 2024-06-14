import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import configs from '../definitions/configs';

import { ISettings } from '../definitions/interfaces';
import videoFiles from '../main/videos';

const defaultSettings : ISettings = { 
  cooldownBetweenVideos: configs.DEFAULT_VIDEO_COOLDOWN, 
  loopDirectory: '',
  useArduino: false,
  selectedPortPath: '',
  startleFile: '',
  startleDistance: configs.MIN_STARTLE_DISTANCE
  
};


function setUndefinedValues(settings: ISettings): ISettings {
  if (settings.cooldownBetweenVideos === undefined) {
    settings.cooldownBetweenVideos = defaultSettings.cooldownBetweenVideos;
  }

  if (settings.loopDirectory === undefined) { 
    settings.loopDirectory = defaultSettings.loopDirectory;
  }

  if (settings.useArduino === undefined) {  
    settings.useArduino = defaultSettings.useArduino;
  }

  if (settings.selectedPortPath === undefined) {
    settings.selectedPortPath = defaultSettings.selectedPortPath;
  } 
  
  if (settings.startleDistance === undefined) {
    settings.startleDistance = defaultSettings.startleDistance;
  }
  

  return settings;
}

function readSettingsFromFile(): ISettings | null {
  const hauntedMirrorDirectory = app.getPath('userData');
  console.log("hauntedMirrorDirectory: ", hauntedMirrorDirectory);
  const settingFilePath : string = path.join(hauntedMirrorDirectory, 'settings.json');
  console.log("hauntedMirrorDirectory: ", settingFilePath);

  
  if (!fs.existsSync(settingFilePath)) {
    console.error('Settings file does not exist. Aborting read.');
    
    return defaultSettings;
  }

  const settingsString = fs.readFileSync(settingFilePath, 'utf-8');

  let settings: ISettings;

  try {
    settings = JSON.parse(settingsString);
    settings = setUndefinedValues(settings);    
  } catch (e) {
    console.error('Error parsing settings file', e);
    return defaultSettings;
  }
  
  let areImagesInDirectory : boolean = false;
  if (settings.loopDirectory) {
    
    try {
      areImagesInDirectory = videoFiles.getMp4FilesForLoop(settings.loopDirectory);
    } catch (e) {
      areImagesInDirectory = false;
    }

    if (!areImagesInDirectory) {
      settings.loopDirectory = '';
    }
  } else {
    settings.loopDirectory = '';
  }

  return settings;
}




function writeSettingsToFile(settings: ISettings): void {
  const hauntedMirrorDirectory = app.getPath('userData');
  
  if (!fs.existsSync(hauntedMirrorDirectory)) {
    console.error('Haunted mirror directory does not exist. Aborting save.');
    return;
  }

  const filePath : string = path.join(hauntedMirrorDirectory, 'settings.json');

  const settingsString = JSON.stringify(settings, null, 2);

  fs.writeFile(filePath, settingsString, (err) => {
    if (err) {
      console.error('Error writing file', err);
    } else {
      console.log('Successfully wrote file');
    }
  });
}

export { writeSettingsToFile, readSettingsFromFile };