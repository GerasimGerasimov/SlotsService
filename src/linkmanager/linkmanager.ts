import {ISlot, ISlotSet, Slot} from './slots'
import {IErrorMessage, ICmdToServer} from '../types/types'
import {SerialController} from '../clients/ws/client'

export class LinkManager {
    private slots: Map<String, ISlot> = new Map();
    private tmpSlotNumber: number = 0;
    private tmpSlot: ISlot = undefined;
    private TimerPullControl: any = undefined;
    private count: number = 0;
    private sendServerHandler: Function = undefined;

    constructor(host: string){
        SerialController.init(host, this.checkIncomingMessage.bind(this));
        this.controlResponds();
    }

    public setServerHandler(sendServerHandler: Function) {
        this.sendServerHandler = sendServerHandler;
    }

    private handleSlotSet(data: ISlotSet): ISlotSet {
        let result:ISlotSet = { ID:'',
                                cmd:[],
                                interval: 1000,
                                NotRespond: false,
                                TimeOut: 1000,
                                ChunksEndTime:10
                            };
        if (!data.ID)  throw new Error ('ID field is missing');
        if (!data.cmd) throw new Error ('cmd field is missing');
        result.ID = data.ID;
        result.cmd = data.cmd;
        result.interval  = data.interval  || 1000 ;
        result.TimeOut   = data.TimeOut   || 1000 ;
        result.NotRespond = (typeof data.NotRespond !== 'undefined') ? data.NotRespond : false ;
        result.ChunksEndTime = data.ChunksEndTime || 10;
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

    private getNextSlot(): ISlot {
        const mapLen = this.slots.size;
        var index: number = 0;
        try {
            if (mapLen) {
                this.slots.forEach((value:ISlot, key: string) => {
                    if (this.tmpSlotNumber >= mapLen) this.tmpSlotNumber = 0;
                    if (index++ == this.tmpSlotNumber) {
                        this.tmpSlotNumber++;
                        throw new Error(key);
                    }
                })
            }
        } catch (e) {
            return this.slots.get(e.message);
        }
        this.tmpSlotNumber = 0;
        this.tmpSlot = undefined;
        return undefined;
    }

    private async checkIncomingMessage(msg: any) {
        if (this.TimerPullControl) clearTimeout(this.TimerPullControl);//остановлю таймер
        if (this.tmpSlot) {
            this.tmpSlot.in = msg;
            console.log(this.count++, this.tmpSlot.ID);
            this.sendRespondToServersClient(this.tmpSlot)
        }
        this.pollNextSlot();
    }

    private sendRespondToServersClient(slot: ISlot) {
        if (this.sendServerHandler) this.sendServerHandler(slot);
    }

    private async pollNextSlot() {
        var NextPollTime: number = 1;
        const slot: Slot = this.getNextSlot();
        this.tmpSlot = slot;
        if (slot) {
            if (this.checkSlotProperties(slot)) {//пришло время запустить слот
                await this.sendCmdToServer(slot);
                NextPollTime = slot.Settings.TimeOut * 2;
            }
        }
        //я надеюсь что слот ответит раньше чем ТаймАут, но если не ответил вообще
        //то надо подтолкнуть очередь (перейти к следующему слоту)
        //если ждать ответа ненадо (но ответ-то "" всё равно есть)
        this.TimerPullControl = setTimeout(this.controlResponds.bind(this), NextPollTime);
    }

    //будет подталвивать поток сообщений
    private controlResponds(){
        this.pollNextSlot();
    }

    public async sendCmdToServer(slot: ISlot): Promise<any | IErrorMessage>{      
        try {
            const request: ICmdToServer = {
                cmd:slot.out,
                    timeOut: slot.Settings.TimeOut,
                        NotRespond: slot.Settings.NotRespond
                        }
            await SerialController.sendCmdToServer(request);
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

}