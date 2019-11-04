import {ICommunicationDriver, CommunicationDriver } from './comdrivers';
import {appendCRC16toArray, getArrayCRC16} from '../crc/crc16'

export class ModbusRTUDriver extends CommunicationDriver implements ICommunicationDriver {
    constructor(settings: any) {
        super('')
    }

    // к команде добавляет к сообщению инфлрмацию для функционирования
    // реализуемого протокола
    public addCtrlToMessage( msg: any): any {
        return appendCRC16toArray(msg);
    }

    //проверяет входящее сообщение на соответствие протоколу
    //возвращает очищенное от служебной информации сообщение
    public validateRespond (msg: any): any {
        const data = this.validateCRC(msg);
        console.log(data);
        return data;
    }

    private validateCRC (msg: any): any{
        //если CRC схлопнулась в НОль значит пакет целый
        if (!getArrayCRC16(msg, msg.length)) {
            return { 'addr': msg[0],
                     'cmd' : msg[1],
                     'data': msg.slice(2, msg.length-2)}
        } else {
            return {
                Status: 'Error',
                Msg: 'CRC Error'
            }
        }
 
    }
}