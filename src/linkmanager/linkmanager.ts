import {ISlot, Slot} from './slots'
import {ICommunicationDriver} from '../comdrivers/comdrivers';
const fetch = require('node-fetch');

export class LinkManager {
    private host: string;//URL коммуникационного порта привязанного к TLnkManager
    private slots: Array<ISlot> = []; // массив слотов 
    private Driver: ICommunicationDriver = null;

    constructor(host: string, driver: ICommunicationDriver){
        this.host = host;
        this.Driver = driver;//[1, 17, 192, 44]
        this.addSlot(this.Driver.addCtrlToMessage([1, 17]), this.onRead);
        this.cycle();
    }

    //добавить слот
    public addSlot (data, callback){
        console.log('TLnkManager.addSlot');
        const slot = new Slot(data, callback);//создаю новый слот
        this.slots.push(slot);//добавляю его в массив слотов
    }

    private handleStatusField (data: any) {
        if (!data.status) throw new Error ('Not Status field');
    }

    private handleErrorStatus(data: any) {
        if (data.status === 'Error') throw new Error (data.msg);
    }

    public handledDataResponce(data: any): any {
        try {
            this.handleStatusField(data);
            this.handleErrorStatus(data);
            return this.Driver.validateRespond(data);
        } catch (e) {
            return {
                status: 'Error',
                msg: e.message
            }
        }
    }

    public async cycle () {
        while (1) {
            let index = this.slots.length;
            while (index != 0 ) {
                const slot: ISlot = this.slots[--index];
                const data = await this.getDataAndState(slot);
                const result = this.handledDataResponce(data);
                console.log(result);
                await this.delay(1);
            }
            await this.delay(0);
        }
    }

    public async getDataAndState(slot: ISlot): Promise<any> {      
        try {
            return await this.getHostState({cmd:slot.out,
                                            timeOut: slot.Settings.TimeOut,
                                            NotRespond: slot.Flow.NoRespond});
        } catch (e) {
            return {
                status: 'Error',
                msg: `${e.message}`
            }
        }
    }

    private handledHTTPResponse (response: any) {
        if (response.status === 404) throw new Error ('Url not found');
        return response.text();
    }

    private validationJSON (data: any) {
        try {
            const res = JSON.parse(data);
            return res;
        } catch (e) {
            return {
                    status: 'Error',
                    msg: 'Invalid JSON'
            }
        }
    }

    private async getHostState(msg: any):Promise<any> {
        try {
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body : JSON.stringify({
                    "cmd": msg.cmd,
                    "timeOut": msg.timeOut,
                    "NotRespond": msg.NotRespond
                })
            }
            return await fetch(this.host, header)
                .then (this.handledHTTPResponse)
                .then (this.validationJSON);
        } catch (e) {
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            }
        }
    }

    private delay(ms: number) {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        });
    }

    private onRead(){

    }
}