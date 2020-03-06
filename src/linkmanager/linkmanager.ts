import {ISlot, ISlotSet, Slot} from './slots'
import {IErrorMessage, ICmdToServer} from '../types/types'
import {SerialController} from '../clients/ws/client'

export class LinkManager {
    private slots: Map<String, ISlot> = new Map();

    constructor(host: string){
        SerialController.init(host);
        this.cycle();
    }

    private handleSlotSet(data: ISlotSet): ISlotSet {
        let result:ISlotSet = { ID:'',
                                cmd:[],
                                interval: 1000,
                                NotRespond: false,
                                TimeOut: 1000
                            };
        if (!data.ID)  throw new Error ('ID field is missing');
        if (!data.cmd) throw new Error ('cmd field is missing');
        result.ID = data.ID;
        result.cmd = data.cmd;
        result.interval  = (typeof data.interval  !== 'undefined') ? data.interval  : 1000 ;
        result.TimeOut   = (typeof data.TimeOut   !== 'undefined') ? data.TimeOut   : 1000 ;
        result.NotRespond = (typeof data.NotRespond !== 'undefined') ? data.NotRespond : false ;
        return result;
    }

    //добавить слот
    public addSlot (data: ISlotSet): string{
        console.log('addSlot');
        const SlotData: ISlotSet = this.handleSlotSet(data);
        //this.isSlotIDExist(SlotData.ID);
        var slot: Slot;
        //TODO если слот уже существует то заменить в нём инфу без органичений
        try {
            slot = this.getSlotByID(SlotData.ID);
        } catch (e) {
            slot = new Slot(SlotData);//создаю новый слот
        }
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

    public getAllSlotsInBuff(): any {
        let result = {};
        for (const [key, value] of this.slots.entries()) {
            result[`${key}`] =  value.in;
        }
        //console.log(result);
        return result;
    }
    
    
    public getRequiredSlotsData(required: Array<string>): any {
        let result = {};
        required.forEach ((key: string) => {
            let value: ISlot = this.slots.get(key);
            if (value === undefined) {
                result[`${key}`] = {
                    status:'Error',
                    msg: `Slot ID:${key} does not exist`
                };
            } else {
                result[`${key}`] =  value.in;
            }
        });
        return result;
    }

    private checkSlotProperties(slot: ISlot): boolean {
        const time = new Date().getTime();
        if (time < slot.NextTime) return false;//время не пришло
        slot.NextTime = time + slot.interval;//время следующего запуска слота
        return true;//запуск слота
    }

    public async cycle () {
        while (true) {
            for (const slot of this.slots.values()) {
                if (this.checkSlotProperties(slot)) {
                    const start = new Date().getTime();
                    const respond = await this.getRespondAndState(slot);
                    const stop = new Date().getTime(); 
                    //console.log(`Duration: ${stop-start}: respond: ${respond.duration}`)
                    slot.in = SerialController.handledDataResponce(respond);
                }
                await this.delay(1);
            }
            await this.delay(1);
        }
    }

    public async getRespondAndState(slot: ISlot): Promise<any | IErrorMessage>{      
        try {
            const request: ICmdToServer = {
                cmd:slot.out,
                    timeOut: slot.Settings.TimeOut,
                        NotRespond: slot.Settings.NotRespond
                        }
            return await SerialController.getHostState(request);
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    private async delay(ms: number): Promise<any> {
        return new Promise((resolve, reject) => {
          setTimeout(resolve, ms);
        });
    }
}