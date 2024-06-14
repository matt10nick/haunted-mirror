import fs from 'fs';
import path from 'path';

class VideoFiles {

  private allVideos: Map<string, Map<string, string>>;
  

  constructor() {
    this.allVideos = new Map<string, Map<string, string>>();
    this.allVideos.set('loop', new Map<string, string>());
    this.allVideos.set('startle', new Map<string, string>());
  }

  getMp4FilesForLoop(directory: string): boolean {
    const videoMap : Map<string, string> = this.allVideos.get('loop');

    return this.getMp4Files(directory, videoMap);
  }

  getMp4FilesForStartle(directory: string): boolean { 
    const videoMap : Map<string, string> = this.allVideos.get('startle');

    return this.getMp4Files(directory, videoMap);
  }


  getMp4Files(directory: string, videoMap: Map<string, string>): boolean {
    let count = 0;
  
    fs.readdirSync(directory).forEach(file => {
      if (path.extname(file) === '.mp4') {
        videoMap.set(file, path.join(directory, file));        
        count++;
      }
    });
  
    return count > 0;
  }  

  getRandomLoopFile(): string | undefined {
    const loopFiles = this.allVideos.get('loop');
    if (!loopFiles) return undefined;
  
    const keys = Array.from(loopFiles.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
  
    return loopFiles.get(randomKey);
  }


  getLoopFiles(): Map<string, string> {
    return this.allVideos.get('loop');
  }
  getStartleFiles(): Map<string, string> {
    return this.allVideos.get('startle');
  }


}

const videoFilesInstance = new VideoFiles();

export default videoFilesInstance;