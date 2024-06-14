import React from "react";
import { useLocation } from "react-router-dom";
import { Button, Divider } from '@mui/material';
import { ISettings } from '../../definitions/interfaces';
import { PlayArrow } from '@mui/icons-material';
import ErrorModal from '../errorModal';
import configs from '../../definitions/configs';
import StartleSettings from './startlesettings';
import LoopSettings from "./loopsettings";


import './config.css';




const ConfigScreen = () => {

  const defaultStartingDistance = Math.floor((configs.MIN_VIDEO_COOLDOWN + configs.MAX_VIDEO_COOLDOWN) / 2);

  const location = useLocation()
  const [delay, setDelay] = React.useState(defaultStartingDistance);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [path, setPath] = React.useState('<Not Set>');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [startButtonDisabled, setStartButtonDisabled] = React.useState(true);
  const [useArduino, setUseArduino] = React.useState(false);
  const [selectedPort, setSelectedPort] = React.useState('' as string);
  const [startleFile, setStartleFile] = React.useState('<Not Set>' as string);
  const [startleDistance, setStartleDistance] = React.useState(configs.MIN_STARTLE_DISTANCE);

  const getSettings = () : ISettings => { 
    
    let newSettings : ISettings = {
      cooldownBetweenVideos: delay,
      loopDirectory: path,
      useArduino: useArduino,
      selectedPortPath: selectedPort,
      startleFile: startleFile,
      startleDistance: startleDistance

    };  

    return newSettings;
  }

  const setSettings = async (settings : ISettings) => {
    
    setDelay(settings.cooldownBetweenVideos);
    setPath(settings.loopDirectory);
    setUseArduino(settings.useArduino);
    setSelectedPort(settings.selectedPortPath);
    setStartleFile(settings.startleFile);
    setStartleDistance(settings.startleDistance);
  }


  React.useEffect(() => {    
    
    let settings : ISettings;

    const fetchData = async () => {      
      settings = await window.electronAPI.getSettings();
      setSettings(settings);

      if (settings.loopDirectory) {
        setStartButtonDisabled(false);
      }

    }
      
    window.electronAPI.stopMirror();
    fetchData();

  }, [location]);

  const acceptModalMessage = () => {
    setModalOpen(false);
  }

  const runMirrorHandler = () => {
    window.electronAPI.runMirror(getSettings());
  }


  const getTargetDirectory = async () => {  
    let newPath : string | null = null;

    try {
      newPath = await window.electronAPI.getLoopDirectory();
    } catch (e) {
      setErrorMsg("No videos found in the selected directory");
      setModalOpen(true);
    }
    if (newPath) {
      setPath(newPath);  
      setStartButtonDisabled(false);
    }
    
  }

  const getStartleFile = async () => {
    let newFile : string | null = null;

    try {
      newFile = await window.electronAPI.getStartleFile();
    } catch (e) {
      setErrorMsg("Error retriving file.");
      setModalOpen(true);
    }
    if (newFile) {
      setStartleFile(newFile);        
    }
  } 

  const setStartleDistanceSliderHandler = (event: React.ChangeEvent<HTMLInputElement>) => {

    setStartleDistance(Number(event.target.value));

  }


  return (
    
        <div className="configs">
          <h1>Mirror Setup</h1>      
          <Divider>Looping Video Settings</Divider>          
          <LoopSettings path={path} delay={delay} setDelay={setDelay} selectButtonHandler={getTargetDirectory} />
          <Divider>Startle Video Settings</Divider>
          <StartleSettings 
            useArduino={useArduino} 
            setUseArduino={setUseArduino}
            selectedPort={selectedPort}
            setSelectedPort={setSelectedPort} 
            setErrorMessage={setErrorMsg}
            setModalOpen={setModalOpen}
            selectStartleFileHandler={getStartleFile}
            startleFile={startleFile}
            setStartleDistanceSliderHandler={setStartleDistanceSliderHandler}
            startleDistance={startleDistance}
          /> 
          <Divider />
          &nbsp;
          <StartButton disabled = {startButtonDisabled} startButtonHandler={runMirrorHandler} />
          <ErrorModal errorMessage={errorMsg} open={modalOpen} onClick={acceptModalMessage}/>
        </div>
      
  );
}

interface IStartButton {  
  disabled: boolean;
  startButtonHandler: () => void;
}

const StartButton = (props : IStartButton) => {


  return (
      <div>        
        <Button disabled = {props.disabled} onClick={props.startButtonHandler} variant="contained" startIcon={<PlayArrow/>}>Start</Button>
      </div>
  );
};

export { StartButton, ConfigScreen };