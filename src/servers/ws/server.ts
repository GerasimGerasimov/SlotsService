import WebSocket = require('ws');
import {LinkManager} from "../../linkmanager/linkmanager";
import {IErrorMessage, ErrorMessage, validationJSON} from '../../types/types'

export default class WSServer {
    private https: any;
    private lm:  LinkManager;
    private wss: any;

    constructor (https: any, lm: LinkManager) {
        this.https = https;
        this.lm = lm;
        this.init()
    }

    private init () {           
        this.wss = new WebSocket.Server({server: this.https});
        this.wss.on('connection', this.connectionOnWss.bind(this));
    }

    private connectionOnWss( ws: WebSocket) {
        console.log('Connection');
        ws.on('message', this.onMessage.bind(this, ws));
        ws.on('close', this.onClose.bind(this, ws))
    }

    private onMessage(ws: WebSocket, message: any) {
        var result: any;
        try {
            const request = validationJSON(message);
            result = this.decodeCommand(request);
        } catch (e) {
            result = ErrorMessage(e.message || '');
        }
        ws.send(JSON.stringify(result));
    }

    private onClose(ws: WebSocket){
        console.log('Connection close');
    }

    private decodeCommand(cmd: any): any | IErrorMessage {
        const key = this.getCmdName(cmd);
        const commands = {
            'add'    : this.addSlot.bind(this),
            'get'    : this.getRequiredSlotsData.bind(this),
            'delete' : this.deleteSlotByID.bind(this),
            'default': () => {
                return ErrorMessage('Unknown command');
            }
        }
        return (commands[key] || commands['default'])(cmd[key])
    }

    private getCmdName(cmd: any): string {
        for (let key in cmd) {
            return key;
          }
        throw new Error ('Invalid request format');
    }

    private deleteSlotByID (request: any): any | IErrorMessage {
            try {
                const ID = this.lm.deleteSlot(request)
                return {
                        status:'OK',
                        time: new Date().toISOString(),
                        result:`Slot ID:${ID} deleted`,
                        ID: ID};
            } catch (e) {
                return ErrorMessage(e.message || '');
            }
    }    

    //отдаёт данные всех слотов    
    private getRequiredSlotsData(request: any): any | IErrorMessage {
        try {
            const required: Array<string> = request;
            console.log(required);
            const data = this.lm.getRequiredSlotsData(required);
            return {
                    status:'OK',
                    time: new Date().toISOString(),
                    slots: data};
        } catch (e) {
            return ErrorMessage(e.message || '');
        }        
    }
    //Добавляет слот
    private addSlot (request: any): any | IErrorMessage {
            try {
                const ID = this.lm.addSlot(request)
                return {
                        status:'OK',
                        time: new Date().toISOString(),
                        result:`Slot ID:${ID} added`,
                        ID: ID}
            } catch (e) {
                return ErrorMessage(e.message || '');
            }
    }
}