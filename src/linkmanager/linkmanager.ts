import {ISlot, Slot} from './slots'
import {ICommunicationDriver} from '../comdrivers/comdrivers';
const fetch = require('node-fetch');
import {IErrorMessage, ICmdToServer} from '../types/types'

export class LinkManager {
    private host: string;//URL коммуникационного порта привязанного к TLnkManager
    private slots: Array<ISlot> = []; // массив слотов 
    private Driver: ICommunicationDriver = null;

    constructor(host: string, driver: ICommunicationDriver){
        this.host = host;
        this.Driver = driver;//[1, 17, 192, 44]
        //this.addSlot([1, 17]);
        this.addSlot([1, 3, 0, 0, 0, 10]);        
        this.cycle();
    }

    //добавить слот
    public addSlot (data): string{
        console.log('TLnkManager.addSlot');
        const slot = new Slot(data);//создаю новый слот
        slot.out = this.Driver.addCtrlToMessage(slot.out);
        this.slots.push(slot);//добавляю его в массив слотов
        return slot.ID;
    }

    private handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Not Status field');
    }

    private handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

    public handledDataResponce(respond: any): any | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return this.Driver.validateRespond(respond);
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    public async cycle () {
        while (true) {
            for (const slot of this.slots) {
                const respond = await this.getRespondAndState(slot);
                const result = this.handledDataResponce(respond);
                console.log(result);
                await this.delay(1);                
            }
            await this.delay(0);
        }
    }

    public async getRespondAndState(slot: ISlot): Promise<any | IErrorMessage>{      
        try {
            const request: ICmdToServer = {
                cmd:slot.out,
                    timeOut: slot.Settings.TimeOut,
                        NotRespond: slot.Flow.NoRespond
                        }
            return await this.getHostState(request);
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    private handledHTTPResponse (response: any) {
        if (response.status === 404) throw new Error ('Url not found');
        return response.text();
    }

    private validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
        }
    }

    private async getHostState(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body : JSON.stringify({
                    "cmd": request.cmd,
                    "timeOut": request.timeOut,
                    "NotRespond": request.NotRespond
                })
            }
            return await fetch(this.host, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch (e) {
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            } as IErrorMessage;
        }
    }

    private delay(ms: number) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        });
    }
}