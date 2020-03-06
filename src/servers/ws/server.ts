import WebSocket = require('ws');
import {LinkManager} from "../../linkmanager/linkmanager";

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

    private async onMessage(ws: WebSocket, message: any) {
        var result: any;
        try {
            //пришёл запрос от клиента, надо его распарсить
            // TODO разработать заголовки объектов
            //result = await this.com.getCOMAnswer(JSON.parse(message));
            
        } catch (e) {
            result = {status:'Error',
                      msg: e.message || ''}
        }
        const res = JSON.stringify(result);
        ws.send(res);
    }

    private onClose(ws: WebSocket){
        console.log('Connection close');
    }

    private getSlotInBuffByID (request: any, response: any) {
        //console.log(`/v1/slot/get> ${request.params.id || ''}`);
        (async ()=>{
            try {
                response.json(this.lm.getSlotByID(request.params.id).in)
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            };
        })();
    }

    private deleteSlotByID (request: any, response: any) {
        //console.log(`/v1/slot/delete> ${request.params.id || ''}`);
            try {
                const ID = this.lm.deleteSlot(request.params.id)
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'result':`Slot ID:${ID} deleted`,
                                'ID': ID})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }    

    //отдаёт данные всех слотов    
    private getAllSlotsData(request: any, response: any) {
        //console.log(`/v1/slots/get>`);
        try {
            const data = this.lm.getAllSlotsInBuff();
            response.json( {'status':'OK',
                            'time': new Date().toISOString(),
                            'slots': data})
        } catch (e) {
            response.status(400).json({'status':'Error',
                                        'msg': e.message || ''})
        }        
    }

    //отдаёт данные всех слотов    
    private getRequiredSlotsData(request: any, response: any) {
        try {
            const required: Array<string> = request.body.slots;
            console.log(required);
            const data = this.lm.getRequiredSlotsData(required);
            response.json( {'status':'OK',
                            'time': new Date().toISOString(),
                            'slots': data})
        } catch (e) {
            response.status(400).json({'status':'Error',
                                        'msg': e.message || ''})
        }        
    }
    //Добавляет слот
    private addSlot (request: any, response: any) {
        //console.log(`/v1/slots/put> ${request.body.cmd || ''}`);
            try {
                const ID = this.lm.addSlot(request.body)
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'result':`Slot ID:${ID} added`,
                                'ID': ID})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }

}