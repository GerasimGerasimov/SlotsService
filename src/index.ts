import NetPorts from "./netports/netports";
import ComPort from "./netports/comport"

const settings = {
    port:'COM3',//название порта
        settings: { // настройки порта
              baudRate: 115200, // this is synced to what was set for the Arduino Code
              dataBits: 8, // this is the default for Arduino serial communication
              parity: 'none', // this is the default for Arduino serial communication
              stopBits: 1, // this is the default for Arduino serial communication
              flowControl: false // this is the default for Arduino serial communication
          }
    }

let COMx: NetPorts = new ComPort(settings);

/*
class Greeting {
 
    private greet: string = 'hello!';
 
    constructor() {
        console.log("Say " + this.greet);
    }
}
 
let myGreeting = new Greeting();
*/