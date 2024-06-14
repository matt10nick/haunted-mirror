import React, { useRef } from 'react';
import { useNavigate } from "react-router-dom";
import './videoplayer.css';
import ErrorModal from './errorModal';


interface IVideoPlayerProps {
  video: string;

}

const VideoPlayer = (props : IVideoPlayerProps) => {
  
  const vidRef = useRef(null);  
  const navigate = useNavigate(); 
  const [errorMsg, setErrorMsg] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    
    if (props.video) {
      vidRef.current.play();          
    } else {
      setErrorMsg('No video file provided');
      setModalOpen(true);
    }

  }, []); 

  const modalOKHandler = () => {
    navigate('/');
  }

  const videoEndHandler = () => {

    window.electronAPI.videoEnded();
    navigate('/Empty');
  }

  return (
    <div>
      {/* <div style={{ color: 'white' }}>Video Player: {props.video}</div> */}
                
      <video className="video-fullscreen" ref={vidRef} onEnded={videoEndHandler}>
         <source src={props.video} type="video/mp4" />
      </video>
      <ErrorModal errorMessage={errorMsg} open={modalOpen} onClick={modalOKHandler}/>
    </div>

  );
}

const StartlePlayer = (props : IVideoPlayerProps) => {
  
  const vidRef = useRef(null);  
  const navigate = useNavigate(); 
  const [errorMsg, setErrorMsg] = React.useState('');
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    
    if (props.video) {
      vidRef.current.play();          
    } else {
      setErrorMsg('No video file provided');
      setModalOpen(true);
    }

  }, []); 

  const modalOKHandler = () => {
    navigate('/');
  }

  const videoEndHandler = () => {

    window.electronAPI.videoEnded();
    navigate('/Empty');
  }

  return (
    <div>
      {/* <div style={{ color: 'white' }}>Video Player: {props.video}</div> */}
                
      <video className="video-fullscreen" ref={vidRef} onEnded={videoEndHandler}>
         <source src={props.video} type="video/mp4" />
      </video>
      <ErrorModal errorMessage={errorMsg} open={modalOpen} onClick={modalOKHandler}/>
    </div>

  );
}

export { VideoPlayer, StartlePlayer };