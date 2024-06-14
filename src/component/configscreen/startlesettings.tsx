import React from "react";
import { FormControlLabel, Switch, InputLabel, Select, Button, MenuItem, Slider } from '@mui/material';
import { FolderOpen } from '@mui/icons-material';

import { IAvaliablePorts } from '../../definitions/interfaces';
import configs from '../../definitions/configs';

import './config.css';

const StartleDetails = (props : any) => {  
  const marks : Array<{ value: number, label: string }> = [ 
    {
      value: configs.MIN_STARTLE_DISTANCE,
      label: `${configs.MIN_STARTLE_DISTANCE}`
    }, 
    { 
      value: configs.MAX_STARTLE_DISTANCE,
      label: `${configs.MAX_STARTLE_DISTANCE}`
    }
  ];

  const [avaliablePorts, setAvaliablePorts] = React.useState(new Array<IAvaliablePorts>);

  const isPortInList = (portList : Array<IAvaliablePorts>, port : string) => {
        
    for (let i = 0; i < portList.length; i++) {
      if (portList[i].path === port) {
        return true;
      } 
    }

    return false; 
  }

  React.useEffect(() => {
    
    const fetchData = async () => {      
      const avaliablePortList = await window.electronAPI.getArduinoPorts(); 
      
      setAvaliablePorts(avaliablePortList);

      if (avaliablePortList.length > 0) {        
        const settings = await window.electronAPI.getSettings();
        props.setSelectedPort(settings.selectedPortPath);
        console.log("setting selected ports: " + settings.selectedPortPath);
      }


      if (avaliablePortList.length === 0) {
        
        props.onErrorLoadingPorts();

      } else {

        if (props.selectedPort) {
          if (isPortInList(avaliablePortList, props.selectedPort)) {
            props.setSelectedPort(props.selectedPort);
          } else {
            props.setSelectedPort(avaliablePortList[0].path);  
          }          
        } else if (avaliablePortList[0]) {
          props.setSelectedPort(avaliablePortList[0].path);
        }

      }

    }
    

    fetchData();
  }, []);

  const selectListChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSelectedPort(event.target.value as string);
  }

  return (
    
    <div>
      { (avaliablePorts.length > 0) ? <div>
        <div className="config_groups">
          <InputLabel id="Active-Ports-Select-Lable">Avaliable Ports</InputLabel>
          <Select
            labelId="Active Ports"
            id="port-select"
            value={props.selectedPort}
            label="Ports"
            onChange={selectListChangeHandler}
          >      
            
            {avaliablePorts.map(port => {
              return <MenuItem key={port.path} value={port.path}>{port.friendlyName}</MenuItem>;
            })}
          
          </Select>
        </div>
        <div className="config_groups">
          <div id="file_btn">
            <Button size="small" variant="contained" type="button" startIcon={<FolderOpen/>} onClick={props.selectStartleFileHandler}>Select</Button>
            <span style={{ padding: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Startle File: </span>
              <span style={{ color: 'rgb(200, 200, 200)' }}> { props.startleFile }</span>
            </span>
          </div>  
        </div>
        <div className="config_groups">
          <p style={{ padding: '0px' }} className="small-text">Distance to Trigger Startle Video: { props.startleDistance } inches.</p>
          <Slider
            style={{ width: '40%' }}
            size="small"
            value = {props.startleDistance}
            aria-label="Play Video Delay Slider"
            valueLabelDisplay="auto"
            min={configs.MIN_STARTLE_DISTANCE}
            max={configs.MAX_STARTLE_DISTANCE}
            onChange={props.setStartleDistanceSliderHandler}
            marks = {marks}
          />            
        </div>
      </div>: null}
    </div>
  );

}




const StartleSettings = (props : any) => {

  const [switchEnabled, setSwitchEnabled] = React.useState(true);

  const noPortsFound = () => {
    setSwitchEnabled(false);
    props.setUseArduino(false);
    props.setErrorMessage("No avaliable ports found. Please connect an Arduino and restart the application.");
    props.setModalOpen(true);    
  }
  

  const arduinoSwitchChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {    

    props.setUseArduino(event.target.checked);

  }

  return (
    <div>
      <FormControlLabel control={<Switch disabled={!switchEnabled} onChange={arduinoSwitchChanged} checked={props.useArduino} />} label="Use Arduino" />
      { props.useArduino ? <StartleDetails 
        selectedPort={props.selectedPort} 
        onErrorLoadingPorts={noPortsFound} 
        setSelectedPort={props.setSelectedPort} 
        selectStartleFileHandler={props.selectStartleFileHandler}
        startleFile={props.startleFile}
        setStartleDistanceSliderHandler={props.setStartleDistanceSliderHandler}
        startleDistance={props.startleDistance}
      /> : null }
    </div>
  );


}

export default StartleSettings;



