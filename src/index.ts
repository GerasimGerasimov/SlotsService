import {LinkManager} from "./linkmanager/linkmanager";
import {ICommunicationDriver} from './comdrivers/comdrivers';
import {ModbusRTUDriver} from './comdrivers/modbusrtu'

const host: string = 'http://localhost:5000/v1/data/'
const ModbusRTU: ICommunicationDriver = new ModbusRTUDriver('Hi');
const lm: LinkManager = new LinkManager(host, ModbusRTU);