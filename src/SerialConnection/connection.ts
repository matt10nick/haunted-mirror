import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { PortInfo } from '@serialport/bindings-interface';

// const { SerialPort } = require('serialport')(__dirname);
// const { ReadlineParser } = require('@serialport/parser-readline')(__dirname);
// // const { PortInfo } = require('@serialport/bindings-interface');

import { IAvaliablePorts } from "../definitions/interfaces";

// The function returns the friendlyName, but the interface doesn't have it
interface extendedPort extends PortInfo {
  friendlyName : string;
}

class SerialConnection {   
  
  private arduinoPortPatternIdentifier = /usb|acm|^com/i;  

  private connected = false;
  private connecting = false;
  private dataHandler : any;

  port : any; // SerialPort;
  parser : any; 

  constructor() {

  }
   

  setDataHandler(handler : any) {
    
    this.dataHandler = handler;    
    
  }

  sendData(data : string) {
    if (this.connected) {
      this.port.write(`<${data}>`);
    } else {
      console.log('Not connected to Arduino');
    }
  }


  testConnection() : void {
    this.port.write('<Hi, I am a computer!>');

  }


  internalDataHandler(data : string) {        

    let command = data.split(String.fromCharCode(13), 1).toString();
    
    // console.log('Command: *' + command.toString() + "*");
    
    switch (command) {

      case "<Arduino is ready>": 
        this.testConnection();   
        break;

      case "Hi, I'm an Arduino": 
        this.connecting = false;
        this.connected = true;
        break;
      
      default:     
        if (this.connected) {
          this.dataHandler(command);
        }    
        break;
    
    }

    
  }


  connectToArduino(pathToArduino : string) {    

    if ((!this.connected) && (!this.connecting)) {      

      this.port = new SerialPort({ path: pathToArduino, baudRate: 9600 })
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
      
      this.parser.on('data', this.internalDataHandler.bind(this));  
      
      this.connecting = true; 
      this.connected = false;    
      
    } else {
      console.log('Already connected to Arduino');
    }

    return this.parser;
  }


  async getPortOptions() : Promise<Array<IAvaliablePorts>> {
    const ports = await SerialPort.list();
    const validPorts : Array<IAvaliablePorts> = [];

    let x : PortInfo; 

    for (const port of ports) {
      
      // Match only portPaths that Arduino cares about
      // ttyUSB#, cu.usbmodem#, COM#
      if (!this.arduinoPortPatternIdentifier.test(port.path)) {
        continue;
      }

      let options : IAvaliablePorts = {
        friendlyName: (port as extendedPort).friendlyName,
        path: port.path
      }

      validPorts.push(options);
    }
    
    return validPorts;
  }

  

}


const serialConenctionInstance = new SerialConnection();

export default serialConenctionInstance;