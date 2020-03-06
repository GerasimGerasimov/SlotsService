import WebSocket = require('ws');
import {IErrorMessage, ICmdToServer, IServiceRespond} from '../../types/types'

type FunctionWebSocketRead = (event: WebSocket.MessageEvent) => void;
type FunctionWebSocketError = (event: WebSocket.ErrorEvent) => void;
type FunctionWebSocketOpen = (event: WebSocket.OpenEvent) => void;
type FunctionWebSocketClose = (event: WebSocket.CloseEvent) => void;

export class SerialController {

    private static host: string;
    private static ws:WebSocket;

    static count: number = 0;

    private static onMessageEvent:  FunctionWebSocketRead = null;
    private static onErrorEvent: FunctionWebSocketError = null;
    private static onOpenEvent: FunctionWebSocketOpen = null;
    private static onCloseEvent: FunctionWebSocketClose = null;

    public static init(host: string){
        this.host = host;
        this.ws = new WebSocket(this.host);
        this.ws.onmessage = this.onMessageEvent = this.onMessage.bind(this);
        this.ws.onerror = this.onErrorEvent = this.onError.bind(this);
        this.ws.onopen = this.onOpenEvent = this.onOpen.bind(this);
        this.ws.onclose = this.onCloseEvent = this.onClose.bind(this);
    }

    private static onOpen(event: any) {
        console.log(`onOpen`);
    }    

    private static onMessage(event: any) {
        console.log(`onMessage: ${this.count++} ${event}`);
    }

    private static onError(event: any) {
        console.log(`onError: ${event}`);
    }

    private static onClose(event: any) {
        console.log(`onClose`);
    }

    private static async waitBufferRelease(): Promise<any> {
        return new Promise((resolve, reject) => {
            var timeOutTimer: any = undefined;
            var chekBufferTimer: any = undefined;
            if (this.ws.bufferedAmount === 0)
                return resolve('OK, buffer is empty'); //буфер чист
            //ошибка, если буфер не очистился за 1 сек 
            timeOutTimer = setTimeout(()=>{
                clearTimeout(timeOutTimer);
                clearInterval(chekBufferTimer);
                reject(new Error ('Time out, buffer does not empty'))
            }, 1000);
            //постоянная проверка буфера на очистку
            chekBufferTimer = setInterval(() => {
                if (this.ws.bufferedAmount === 0) {
                    clearTimeout(timeOutTimer);
                    clearInterval(chekBufferTimer);
                    return resolve('OK, buffer is empty'); //буфер чист
                }
            }, 1);
        });
    }

    private static async send(request: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                //отбой сразу если нет соединения
                if (this.ws.readyState !== WebSocket.OPEN) 
                    reject( new Error ('WebSocket is not connected to host'))
                //как-то надо подождать если есть не отправленные байты
                await  this.waitBufferRelease();
                //теперь отправлю сообщение и дождусь на него ответ, или тайм аут
                this.ws.send(request);
                //ошибка, если буфер не получу ответ за 1 сек 
                const timeOutTimer = setTimeout(()=>{
                    clearTimeout(timeOutTimer);
                    reject(new Error ('time out'))
                }, 3000);
                this.ws.onmessage = (msg: any) => {
                    clearTimeout(timeOutTimer);
                    console.log(`onMessage: ${this.count++} ${msg.data}`);
                    //return resolve(Array.prototype.slice.call(msg.data,0));
                    return resolve(msg.data);
                }            
                //Ecли ошибка сокета  
                this.ws.onerror = (msg: any) => {
                        clearTimeout(timeOutTimer);
                        reject(new Error(msg));
                }
            } catch (e) {
                return reject (new Error (e.message))
            }                      
        })
    }

    public static async getHostState(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            const payload = JSON.stringify(request);
            return await this.send(payload)
                .then (this.validationJSON);
        } catch (e) {
            return {
                status: 'Error',
                msg: `Fetch Error: ${e.message}`
            } as IErrorMessage;
        }
    }

    private static validationJSON (data: any): any | IErrorMessage {
        try {
            return JSON.parse(data);
        } catch (e) {
            return {status: 'Error', msg: 'Invalid JSON'} as IErrorMessage;
        }
    }

    public static handledDataResponce(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return {status: 'Error', msg: e.message} as IErrorMessage;
        }
    }

    private static handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private static handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

}