import WebSocket = require('ws');

export default class WSControl {

    private static host: string;
    private static ws:WebSocket;
    private static hostState: boolean = false;

    static count: number = 0;

    public static init(host: string){
        this.host = host;
        this.initSocket();
    }

    public static async send(request: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.hostState)
                    reject( new Error ('WebSocket is not connected to host')) 
                //отбой сразу если нет соединения
                if (this.ws.readyState !== WebSocket.OPEN) 
                    reject( new Error ('WebSocket is not connected to host'))
                //как-то надо подождать если есть не отправленные байты
                await  this.waitBufferRelease();
                //теперь отправлю сообщение и дождусь на него ответ, или тайм аут
                this.ws.send(request);
                //ошибка, если буфер не получу ответ за 1 сек 
                const timeOutTimer = setTimeout( ()=>{
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

    // Инициализация сокета и восстановление связи
    private static initSocket() {
        this.ws = new WebSocket(this.host);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    }

    private static onOpen(event: any) {
        console.log(`Opened connection to ${this.host}`);
        this.hostState = true;
    }    

    private static onError(event: any) {
        console.log(`Error of connection to ${this.host} ${event}`);
    }

    private static onClose(event: any) {
        console.log(`Closed connection to ${this.host}`);
        this.hostState = false;
        setTimeout(() => {
            console.log(`Try connect to ${this.host}`);
            this.initSocket();
        }, 1000);        
    }

    //чтени сокета в режиме запрос-ожидание ответа- ответ
    private static async waitBufferRelease(): Promise<any> {
        return new Promise((resolve, reject) => {
            var timeOutTimer: any = undefined;
            var chekBufferTimer: any = undefined;
            if (this.ws.bufferedAmount === 0)
                return resolve('OK, buffer is empty'); //буфер чист
            //ошибка, если буфер не очистился за 1 сек 
            timeOutTimer = setTimeout( () => {
                clearTimeout(timeOutTimer);
                clearInterval(chekBufferTimer);
                reject(new Error ('Time out, buffer does not empty'))
            }, 1000);
            //постоянная проверка буфера на очистку
            chekBufferTimer = setInterval( () => {
                if (this.ws.bufferedAmount === 0) {
                    clearTimeout(timeOutTimer);
                    clearInterval(chekBufferTimer);
                    return resolve('OK, buffer is empty'); //буфер чист
                }
            }, 1);
        });
    }
}