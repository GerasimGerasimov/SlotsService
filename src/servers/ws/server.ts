import http = require('http');
import express = require("express");
import bodyParser = require('body-parser');
import {LinkManager} from "../linkmanager/linkmanager";


const app = express();
const jsonParser = bodyParser.json()

export class HttpServer {
    public https: any;

    private port: number;
    private lm:  LinkManager;

    constructor (port: number, lm: LinkManager) {
        this.port = port;
        this.lm = lm;
        this.init()
    }

    private init () {
        app.all('*', function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        app.route('/v1/slot/:id')
        .get   (jsonParser, [this.getSlotInBuffByID.bind(this)])
        .delete(jsonParser, [this.deleteSlotByID.bind(this)]);

        app.route('/v1/slots/')
            .get   (jsonParser, [this.getAllSlotsData.bind(this)])
            .put   (jsonParser, [this.addSlot.bind(this)]);
        
        app.route('/v2/slots/')
        .put   (jsonParser, [this.getRequiredSlotsData.bind(this)]);
            
        this.https = http.createServer(app).listen(this.port);
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