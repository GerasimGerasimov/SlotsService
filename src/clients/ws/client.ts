import WSControl from '../ws/controllers/wscontroller'
import {IErrorMessage, ErrorMessage, ICmdToServer, IServiceRespond, validationJSON} from '../../types/types'

export class SerialController {
    private static wss: WSControl;
    private static onIncomingMessage: Function = undefined;

    public static init(host: string, handler: Function){
        this.wss = new WSControl(host, this.checkIncomingMessage.bind(this));
        this.onIncomingMessage = handler;
    }

    public static checkIncomingMessage(msg: any) {
        let respond: any = validationJSON(msg);
            respond = this.handledIncomingData(respond);
        if (this.onIncomingMessage) this.onIncomingMessage(respond);
    }

    public static async sendCmdToServer(request: ICmdToServer):Promise<any | IErrorMessage> {
        try {
            await this.wss.send(request)
        } catch (e) {
            return ErrorMessage (`Fetch Error: ${e.message}`);
        }
    }

    public static handledIncomingData(respond: any): IServiceRespond | IErrorMessage {
        try {
            this.handleStatusField(respond);
            this.handleErrorStatus(respond);
            return respond as IServiceRespond;
        } catch (e) {
            return ErrorMessage (e.message);
        }
    }

    private static handleStatusField (respond: any): void {
        if (!respond.status) throw new Error ('Status field does not exist');
    }

    private static handleErrorStatus(respond: any): void {
        if (respond.status === 'Error') throw new Error (respond.msg);
    }

}