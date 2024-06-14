import  { pathToFileURL } from 'url';
import { net } from 'electron';  


const handleFileProtocl = (request : any) => {
  
  const { pathname } = new URL(request.url);

  // Add Logic to make sure this is in the list of valid files to play

  const decodePathName : string = decodeURI(pathname);
  const urlPathName : string =  pathToFileURL(decodePathName).toString();
  
  return net.fetch(urlPathName);
  
}

const convertToHauntProtocol = (filePath : string) : string => {
  
  const urlPathToVideoFile = pathToFileURL(filePath).toString();

  if (urlPathToVideoFile.length === 0) {  
    return "";
  }

  if (!urlPathToVideoFile.includes('file:///')) {  
    return "";
  }
  
  const newPathUsingHauntProtocol = urlPathToVideoFile.replace('file:///', 'haunt:///');

  return newPathUsingHauntProtocol;
}

export { handleFileProtocl, convertToHauntProtocol }