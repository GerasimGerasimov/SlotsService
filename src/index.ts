import {LinkManager} from "./linkmanager/linkmanager";
import {ICommunicationDriver} from './comdrivers/comdrivers';

const host: string = 'http://localhost:5000/v1/data/'
const ModbusRTU: ICommunicationDriver = {name: 'Modbus RTU'};
const lm: LinkManager = new LinkManager(host, ModbusRTU);