import  { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { PortInfo } from '@serialport/bindings-interface';

import configs from '../definitions/configs';
import { IAvaliablePorts } from "../definitions/interfaces";
import { c } from 'vite/dist/node/types.d-aGj9QkWt';

// The function returns the friendlyName, but the interface doesn't have it
interface extendedPort extends PortInfo {
  friendlyName : string;
}


class SerialConnection {   
  
  private arduinoPortPatternIdentifier = /usb|acm|^com/i;  

  private handshake = false;
  private dataHandler : any;

  port : any; // SerialPort;
  parser : any; 

  constructor() {

  }
   
  isConnected() : boolean {    
    return this.handshake;
  }

  setDataHandler(handler : any) {
    
    this.dataHandler = handler;    
    
  }

  sendData(data : string) {
    if (this.handshake) {
      this.port.write(`<${data}>`);
    } else {
      console.log('Not connected to Arduino');
    }
  }

  closeConnection() : Promise<any> {
    return new Promise((resolve, reject) => {
      if ((this.port) && (this.port.isOpen)) {
        let path = this.port.path;
        // This function accepts a variable which may contain an error, but the typescript definations don't know that.
        this.port.close(() => {          
          console.log(`Port Closed: ${path}`);
          return resolve(null)
        });
      } else {
        console.log("No Port to Close");
        return resolve(null);
      }
    }

  )}

  async clearConnection() {
  
    if ((this.port) && (this.port.isOpen)) {
      console.log(`Existing connection on ${this.port.path}. Closing Port`);
      await this.closeConnection();  
    }

    this.port = null;
    this.parser = null;
    this.handshake = false;
  }


  async testConnection(newPort : string) : Promise<boolean> {
    
    console.log("Testing Connection to Arduino on Port: " + newPort);

    await this.clearConnection();
    
    return new Promise((resolve, reject) => {
  
      console.log("Attempting to connect to Arduino on port: " + newPort);      
      this.connectToArduino(newPort);  
      
      //Wait for Arduino to respond
      setTimeout(() => {
        if (this.handshake) {
          console.log("Connection Test Successful");
          return resolve(true);
        } else {          
          this.clearConnection().then(() => {
            console.log("Handshake never complete. Marking as failed.");
            return resolve(false);
          });     
        }
      }, configs.CONNECTION_TIMEOUT);
    });  
  }

  sendTestMessage() : void {
    this.port.write('<Hi, I am a computer!>');
  }


  internalDataHandler(data : string) {        

    let command = data.split(String.fromCharCode(13), 1).toString();
    
    // console.log('Command: *' + command.toString() + "*");
    
    switch (command) {

      case "<Arduino is ready>": 
        console.log("Sending handshake message to Arduino");
        this.sendTestMessage();   
        break;

      case "Hi, I'm an Arduino": 
        this.handshake = true;
        console.log("Arduino handshake message received. Marking as connected.");

        break;
      
      default:     
        if (this.handshake) {
          this.dataHandler(command);
        } else {
          console.log("Errant Message from COM Port");
        }
        break;    
    }    
  }

  


  async connectToArduino(pathToArduino : string) {
    
    if (this.port) {
        if ((this.port.isOpen) && (this.port.path === pathToArduino)) {
          console.log("Already connected to Arduino on Port " + pathToArduino);
          return this.parser;
        } else {
          // Kills the existing connection if the system wants to make a new one. 
          await this.clearConnection();
        }
    }

    
    this.port = new SerialPort({ path: pathToArduino, baudRate: 9600, endOnClose: true, autoOpen: true }, (error) => {       
      if (error) {
        // I don't think this code is reachable with autoOpen set to false
        console.log(error);
        this.port = null;
        this.handshake = false;
      }
    });  

    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
    this.parser.on('data', this.internalDataHandler.bind(this));  

    this.port.on('open', function() {
      console.log("The system is connected to Port " + pathToArduino);    
    });


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