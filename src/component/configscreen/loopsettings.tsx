import { Button, Slider } from '@mui/material';
import configs from '../../definitions/configs';
import { FolderOpen } from '@mui/icons-material';



interface ILoopSettings { 

  delay: number,
  setDelay: (delay: number) => void,
  selectButtonHandler: () => void,
  path: string
  
}



const LoopSettings = (props : any) => {

  const marks : Array<{ value: number, label: string }> = [ 
    {
      value: configs.MIN_VIDEO_COOLDOWN,
      label: `${configs.MIN_VIDEO_COOLDOWN}`
    }, 
    { 
      value: configs.MAX_VIDEO_COOLDOWN,
      label: `${configs.MAX_VIDEO_COOLDOWN}`
    }

  ];

  const delaySliderChangeHandler = (event: any, newValue: number) => {

    props.setDelay(newValue);    

  }

  return (
    <div>
      <div id="file_btn">
        <Button size="small" variant="contained" type="button" startIcon={<FolderOpen/>} onClick={props.selectButtonHandler}>Select</Button>
        <span style={{ padding: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Video Directory: </span>
          <span style={{ color: 'rgb(200, 200, 200)' }}> { props.path }</span>
        </span>
      </div>  
      <div>
        <p style={{ padding: '0px' }}className="small-text">Time Between Videos: { props.delay } seconds.</p>
        <Slider
          style={{ width: '40%' }}
          size="small"
          value = {props.delay}
          aria-label="Play Video Delay Slider"
          valueLabelDisplay="auto"
          min={configs.MIN_VIDEO_COOLDOWN}
          max={configs.MAX_VIDEO_COOLDOWN}
          onChange={delaySliderChangeHandler}
          marks = {marks}
        />            
      </div>
    </div>
  );

}

export default LoopSettings;