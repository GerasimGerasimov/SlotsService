import {ISlot, Slot} from './slots'
const fetch = require('node-fetch');

export default class LinkManager {
    private host: string;//URL коммуникационного порта привязанного к TLnkManager
    private slots: Array<ISlot> = []; // массив слотов 
    private index: number = 0; // номер активного слота
    private self: LinkManager = this;
    private UpdateTimerID:any = null;

    constructor(host: string){
        this.host = host;
        this.addSlot([1, 17, 192, 44], this.onRead);
        this.start();
    }

    //добавить слот
    public addSlot (data, callback){
        console.log('TLnkManager.addSlot');
        const slot = new Slot(data, callback);//создаю новый слот
        this.slots.push(slot);//добавляю его в массив слотов
    }

    public async start () {
        console.log('TLnkManager.start');
        this.chekPortOpen();
        await this.run('');
    }

    //запускает Линк Манагер в автоматическую работу
    private chekPortOpen (): void {
        /*
        (this.port.isOpen)
        ? this.run('PortOpen')
        : this.timerOpenPortID= setTimeout (this.chekPortOpen.bind(self),1000);
        */
    }

    private handledResponse = (response: any) => {
        console.log(response);
        /*
        switch (response.status) {
            case 400: throw new CustomFetchError ('Bad request'   , response.status)
            case 404: throw new CustomFetchError ('Url not found' , response.status)        
            case 401: throw new CustomFetchError (response.message, response.status)                        
        }
        */
        return response.json()
    }

    private validationJSON = (data: any) => {
        console.log('AddGroup:data:',data)
        return data
    }

    private startUpdateTimer =() => {
        this.UpdateTimerID = setTimeout(()=>{}, 1000);
    }

    private async run(msg: string) {
        try {
            //console.log('MainPageImagesController:getImages:', url, username, token);
            const header: any = {
                method: 'PUT',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body : JSON.stringify({
                    "cmd": [1, 17, 192, 44],
                    "timeOut":300,
                    "wait": true
                })
            }
            return await fetch(this.host, header)
                .then (this.handledResponse)
                .then (this.validationJSON);
        } catch (err) {
            console.log(err);
        }
    }

    private onRead(){

    }
}