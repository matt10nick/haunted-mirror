import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

const Blackout = (props : any) => {
  
  const navigate = useNavigate(); 
  

  
  React.useEffect(() => {
    window.electronAPI.onPlayVideo((pathToVideoFile : string) => {
      
      props.videoChangeHandler(pathToVideoFile); 
      navigate(`/PlayVideo`);      
    });

    window.electronAPI.onStartleVideo((pathToVideoFile : string) => {
      
      props.videoChangeHandler(pathToVideoFile); 
      navigate(`/StartleVideo`);      
    });

    window.electronAPI.onNavTo((location : string) => {      
      const path = `/${location}`;       
      navigate(path);
    });
  }, []); 


  return (
      <div style={{ backgroundColor: 'black', height: '100vh', width: '100vw' }}>        
        <div id="screen">
          <Outlet />
        </div>
      </div>
  );
};


export { Blackout };