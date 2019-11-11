import {ISlot, ISlotSet, Slot} from './slots'
const fetch = require('node-fetch');
import {IErrorMessage, ICmdToServer} from '../types/types'

export class LinkManager {
    private host: string;//URL коммуникационного порта привязанного к TLnkManager
    //private slots: Array<ISlot> = []; // массив слотов 
    private slots: Map<String, ISlot> = new Map();

    constructor(host: string){
        this.host = host;     
        this.cycle();
    }

    private handleSlotSet(data: ISlotSet): ISlotSet {
        let result:ISlotSet = {ID:'', cmd:[], interval: 1000};
        if (!data.ID)  throw new Error ('ID field is missing');
        if (!data.cmd) throw new Error ('cmd field is missing');
        result.ID = data.ID;
        result.cmd = data.cmd;
        result.interval = (typeof data.interval !== 'undefined') ? data.interval : 1000 ;
        return result;
    }

    //добавить слот
    public addSlot (data: ISlotSet): string{
        console.log('addSlot');
        const SlotData: ISlotSet = this.handleSlotSet(data);
        this.isSlotIDExist(SlotData.ID);
        const slot = new Slot(SlotData);//создаю новый слот
        this.slots.set(SlotData.ID, slot);//добавляю его в карту слотов
        return slot.ID;
    }

    //удалить слот
    public deleteSlot(ID: string): string {
        console.log('deleteSlot');
        this.getSlotByID(ID);//будет throw если слота нет
        this.slots.delete(ID);
        return ID;
    }
    private isSlotIDExist(ID: string): void {
        let result: boolean = false;
        try {
            result = (this.getSlotByID(ID) !== undefined);
        } catch (e) {}
        if (result) throw new Error (`Slot ID:${ID} already exist`);
    }

    public getSlotByID(ID: string): ISlot {
        let slot = this.slots.get(ID);
        if (!slot) throw new Error (`Slot ID:${ID} does not exist`);
        return slot;
    }

    private handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

    public handledDataResponce(respond: any): any | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond;
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    public async cycle () {
        while (true) {
            for (const slot of this.slots.values()) {
                const respond = await this.getRespondAndState(slot);
                slot.in = this.handledDataResponce(respond);
                console.log(slot.in);
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