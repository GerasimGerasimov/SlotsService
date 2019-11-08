import express = require("express");
import bodyParser = require('body-parser');
import {LinkManager} from "../linkmanager/linkmanager";

const app = express();
const jsonParser = bodyParser.json()

export interface IServer {
    serve (): void;
}

export class AppServer implements IServer{

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
    }

    private get (request: any, response: any) {
        console.log(`/v1/data/get> ${request.body.cmd || ''}`);
        (async ()=>{
            try {
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'msg':'Hello'})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            };
        })();
    }

    private addSlot (request: any, response: any) {
        console.log(`/v1/slots/put> ${request.body.cmd || ''}`);
            try {
                const ID = this.lm.addSlot(request.body.cmd)
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'result':`Slot ID:${ID} added`,
                                'ID': ID})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }

    private deleteSlot (request: any, response: any) {
        console.log(`/v1/slots/delete> ${request.body.id || ''}`);
            try {
                //const ID = this.lm.addSlot(request.body.cmd)
                const ID = request.body.id;
                response.json( {'status':'OK',
                                'time': new Date().toISOString(),
                                'result':`Slot ID:${ID} deleted`,
                                'ID': ID})
            } catch (e) {
                response.status(400).json({'status':'Error',
                                            'msg': e.message || ''})
            }
    }

    public serve (): void {
        app.route('/v1/data/')
            .get(jsonParser, [this.get.bind(this)]);

        app.route('/v1/slots/')
            .put   (jsonParser, [this.addSlot.bind(this)])
            .delete(jsonParser, [this.deleteSlot.bind(this)]);
        app.listen(this.port);
    } 
}