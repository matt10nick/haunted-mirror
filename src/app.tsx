
import React from "react";
import ReactDOM from "react-dom/client";
import { Blackout } from "./component/blackout";
import { VideoPlayer, StartlePlayer } from "./component/videoplayer";
import { ConfigScreen } from "./component/configscreen/config";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


const Mirror = () => {

  const [video, setVideo] = React.useState<string>("");

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />    
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Blackout videoChangeHandler={setVideo} />} >
            <Route path="/" element={<ConfigScreen />} />
            <Route path="/PlayVideo" element={<VideoPlayer video={video} />} />
            <Route path="/StartleVideo" element={<StartlePlayer video={video} />} />
            <Route path="/Empty" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );

}

//const root = createRoot(document.body);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<Mirror />);