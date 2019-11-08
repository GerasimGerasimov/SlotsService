import {LinkManager} from "./linkmanager/linkmanager";
import {ICommunicationDriver} from './comdrivers/comdrivers';
import {ModbusRTUDriver} from './comdrivers/modbusrtu'
import {AppServer, IServer} from "./server/server"

const host: string = 'http://localhost:5000/v1/data/'
const ModbusRTU: ICommunicationDriver = new ModbusRTUDriver('Hi');
const lm: LinkManager = new LinkManager(host, ModbusRTU);
const Server: IServer = new AppServer(5001, lm);
Server.serve();