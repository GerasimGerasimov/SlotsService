import {ICommunicationDriver, CommunicationDriver } from './comdrivers';
import {appendCRC16toArray, getArrayCRC16} from '../crc/crc16'
import {IParsedAnswer, IErrorMessage, IServiceRespond} from '../types/types'

export class ModbusRTUDriver extends CommunicationDriver implements ICommunicationDriver {
    constructor(settings: any) {
        super('')
    }

    // к команде добавляет к сообщению информацию для функционирования
    // реализуемого протокола
    public addCtrlToMessage( msg: any): any {
        return appendCRC16toArray(msg);
    }

    public ValidateMsgFill(msg: IServiceRespond): void {
        if (!msg.msg) throw new Error ('There is no "msg" field in respond');
    }
    //проверяет входящее сообщение на соответствие протоколу
    //возвращает очищенное от служебной информации сообщение
    public validateRespond (msg: IServiceRespond): any | IErrorMessage {
        var data: any;
        try {
            this.ValidateMsgFill(msg);
            data = {...msg, ...this.validateCRC(msg.msg)};
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
        return data;
    }

    private validateCRC (msg: any): IParsedAnswer {
        //если CRC схлопнулась в НОль значит пакет целый
        if (!getArrayCRC16(msg, msg.length)) {
            return {
                addr: msg[0],
                cmd: msg [1],
                msg: msg.slice(2, msg.length-2) 
            } as IParsedAnswer
        } else {
            throw new Error ('CRC Error')
        }
 
    }
}